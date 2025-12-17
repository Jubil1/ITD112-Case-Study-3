import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import * as tf from '@tensorflow/tfjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute("/ml")({
  component: MachineLearningPage,
});

interface LSTMModel {
  id?: string;
  modelName: string;
  lookback: number;
  lstmNeurons: number;
  dropout: number;
  mae: number | null;
  accuracy: number | null;
  trained: boolean;
  trainedAt?: Date;
  trainedModel?: tf.LayersModel;
  testResults?: {
    actual: number[];
    predicted: number[];
  };
  normalizationParams?: {
    min: number;
    max: number;
  };
}

interface EmigrationData {
  Year: number;
  [country: string]: any;
}

interface ForecastResults {
  forecasts: Array<{ year: number; predicted: number; type: string }>;
  historical: Array<{ year: number; actual: number; type: string }>;
  combined: Array<{ year: number; actual?: number; predicted?: number; type: string }>;
}

interface TuningProgress {
  current: number;
  total: number;
  currentConfig: string;
  bestSoFar: { accuracy: number; config: string } | null;
}

type TabType = 'training' | 'bestModel' | 'forecast' | 'history';
type DatasetType = 
  | 'emigrantData_age'
  | 'emigrantData_civilStatus'
  | 'emigrantData_destination'
  | 'emigrantData_education'
  | 'emigrantData_occupation'
  | 'emigrantData_province'
  | 'emigrantData_sex';

function MachineLearningPage() {
  const [activeTab, setActiveTab] = useState<TabType>('training');
  const [models, setModels] = useState<LSTMModel[]>([]);
  const [bestModel, setBestModel] = useState<LSTMModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tuning, setTuning] = useState(false);
  const [emigrationData, setEmigrationData] = useState<EmigrationData[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tuningProgress, setTuningProgress] = useState<TuningProgress | null>(null);
  const [forecastYears, setForecastYears] = useState(10);
  const [forecasting, setForecasting] = useState(false);
  const [forecastResults, setForecastResults] = useState<ForecastResults | null>(null);
  const [autoTrainingComplete, setAutoTrainingComplete] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('emigrantData_destination');

  // Hyperparameter search space
  const HYPERPARAMETERS = {
    lookback: [3],
    lstmNeurons: [32, 50, 64, 100],
    dropout: [0.1]
  };

  // Load emigration data on mount or dataset change
  useEffect(() => {
    const initializeSystem = async () => {
      await loadEmigrationData();
      await loadSavedModels();
      // Reset training state when dataset changes
      setAutoTrainingComplete(false);
      setBestModel(null);
      setForecastResults(null);
    };
    
    initializeSystem();
  }, [selectedDataset]);

  const loadEmigrationData = async () => {
    try {
      setLoading(true);
      setDataLoaded(false);
      const q = query(collection(db, selectedDataset), orderBy("Year"));
      const querySnapshot = await getDocs(q);
      
      const data: EmigrationData[] = querySnapshot.docs.map((doc) => doc.data() as EmigrationData);
      setEmigrationData(data);
      setDataLoaded(true);
      console.log(`Loaded ${data.length} years of ${selectedDataset} data`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emigration data");
      console.error("Error loading emigration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedModels = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "lstm_models", selectedDataset, "models"));
      const savedModels: LSTMModel[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        modelName: doc.data().modelName,
        lookback: doc.data().lookback,
        lstmNeurons: doc.data().lstmNeurons,
        dropout: doc.data().dropout,
        mae: doc.data().mae,
        accuracy: doc.data().accuracy,
        trained: false,
        trainedAt: doc.data().trainedAt?.toDate(),
      }));
      
      setModels(savedModels);
      
      if (savedModels.length > 0) {
        const best = savedModels.reduce((prev, current) => 
          (current.accuracy || 0) > (prev.accuracy || 0) ? current : prev
        );
        console.log(`Found best saved model: ${best.modelName} with ${best.accuracy}% accuracy`);
      }
    } catch (err) {
      console.error("Error loading saved models:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractTimeSeriesData = () => {
    const timeSeriesData: number[] = [];
    
    emigrationData.forEach((yearData) => {
      let totalEmigrants = 0;
      
      Object.entries(yearData).forEach(([key, value]) => {
        if (key === "Year") return;
        
        const emigrants =
          typeof value === "object" && value !== null && "emigrants" in value
            ? (value as { emigrants: number }).emigrants
            : 0;
        
        totalEmigrants += emigrants;
      });
      
      timeSeriesData.push(totalEmigrants);
    });
    
    return timeSeriesData;
  };

  const normalizeData = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalized = data.map(val => (val - min) / (max - min));
    return { normalized, min, max };
  };

  const denormalizeData = (normalized: number[], min: number, max: number) => {
    return normalized.map(val => val * (max - min) + min);
  };

  const createSequences = (data: number[], lookback: number) => {
    const X: number[][] = [];
    const y: number[] = [];
    
    for (let i = lookback; i < data.length; i++) {
      X.push(data.slice(i - lookback, i));
      y.push(data[i]);
    }
    
    return { X, y };
  };

  const buildLSTMModel = (lookback: number, units: number, dropout: number) => {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
      units: units,
      inputShape: [lookback, 1],
      dropout: dropout,
      returnSequences: false
    }));
    
    model.add(tf.layers.dense({
      units: 1
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  };

  const trainSingleModel = async (
    lookback: number, 
    neurons: number, 
    dropout: number,
    modelName: string
  ): Promise<LSTMModel> => {
    const timeSeriesData = extractTimeSeriesData();
    
    if (timeSeriesData.length < lookback + 10) {
      throw new Error(`Not enough data. Need at least ${lookback + 10} data points.`);
    }
    
    const { normalized, min, max } = normalizeData(timeSeriesData);
    
    const splitIndex = Math.floor(normalized.length * 0.8);
    const trainData = normalized.slice(0, splitIndex);
    const testData = normalized.slice(splitIndex);
    
    const trainSeq = createSequences(trainData, lookback);
    const testSeq = createSequences(testData, lookback);
    
    const trainX = tf.tensor3d(trainSeq.X.map(seq => seq.map(val => [val])));
    const trainY = tf.tensor2d(trainSeq.y, [trainSeq.y.length, 1]);
    const testX = tf.tensor3d(testSeq.X.map(seq => seq.map(val => [val])));
    const testY = tf.tensor2d(testSeq.y, [testSeq.y.length, 1]);
    
    const lstmModel = buildLSTMModel(lookback, neurons, dropout);
    
    await lstmModel.fit(trainX, trainY, {
      epochs: 50,
      batchSize: 8,
      validationData: [testX, testY],
      shuffle: true,
      verbose: 0
    });
    
    const predictions = lstmModel.predict(testX) as tf.Tensor;
    const predArray = await predictions.array() as number[][];
    const testYArray = await testY.array() as number[][];
    
    const denormPred = denormalizeData(predArray.map(p => p[0]), min, max);
    const denormActual = denormalizeData(testYArray.map(p => p[0]), min, max);
    
    const mae = denormPred.reduce((sum, pred, i) => sum + Math.abs(pred - denormActual[i]), 0) / denormPred.length;
    
    const percentageErrors = denormPred.map((pred, i) => {
      const error = Math.abs(pred - denormActual[i]) / denormActual[i];
      return Math.max(0, 1 - error);
    });
    const accuracy = (percentageErrors.reduce((sum, acc) => sum + acc, 0) / percentageErrors.length) * 100;
    
    trainX.dispose();
    trainY.dispose();
    testX.dispose();
    testY.dispose();
    predictions.dispose();
    
    return {
      modelName,
      lookback,
      lstmNeurons: neurons,
      dropout,
      mae: parseFloat(mae.toFixed(2)),
      accuracy: parseFloat(accuracy.toFixed(2)),
      trained: true,
      trainedModel: lstmModel,
      testResults: {
        actual: denormActual,
        predicted: denormPred
      },
      normalizationParams: { min, max },
      trainedAt: new Date()
    };
  };

  const autoTuneModels = async () => {
    if (!dataLoaded || emigrationData.length === 0) {
      console.log("Waiting for emigration data to load...");
      return;
    }

    setTuning(true);
    setError(null);
    const allModels: LSTMModel[] = [];
    
    try {
      const combinations: Array<{lookback: number, neurons: number, dropout: number}> = [];
      
      HYPERPARAMETERS.lookback.forEach(lb => {
        HYPERPARAMETERS.lstmNeurons.forEach(neurons => {
          HYPERPARAMETERS.dropout.forEach(dropout => {
            combinations.push({ lookback: lb, neurons, dropout });
          });
        });
      });

      const totalCombinations = combinations.length;
      console.log(`🤖 Auto-training: Testing ${totalCombinations} hyperparameter combinations...`);
      
      let bestAccuracy = 0;
      let bestConfig = "";

      for (let i = 0; i < combinations.length; i++) {
        const { lookback, neurons, dropout } = combinations[i];
        const configName = `L${lookback}_N${neurons}_D${dropout}`;
        
        setTuningProgress({
          current: i + 1,
          total: totalCombinations,
          currentConfig: `Lookback: ${lookback}, Neurons: ${neurons}, Dropout: ${dropout}`,
          bestSoFar: bestAccuracy > 0 ? { accuracy: bestAccuracy, config: bestConfig } : null
        });

        console.log(`Training model ${i + 1}/${totalCombinations}: ${configName}`);
        
        try {
          const model = await trainSingleModel(lookback, neurons, dropout, configName);
          allModels.push(model);
          
          if ((model.accuracy || 0) > bestAccuracy) {
            bestAccuracy = model.accuracy || 0;
            bestConfig = configName;
          }
          
          console.log(`✓ ${configName}: MAE=${model.mae}, Accuracy=${model.accuracy}%`);
        } catch (err) {
          console.error(`✗ Failed to train ${configName}:`, err);
        }
      }

      allModels.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
      setModels(allModels);
      
      if (allModels.length > 0) {
        setBestModel(allModels[0]);
        console.log(`🏆 Best model: ${allModels[0].modelName} with ${allModels[0].accuracy}% accuracy`);
        setAutoTrainingComplete(true);
        setActiveTab('bestModel');
      }
      
    } catch (err) {
      console.error("Auto-tuning error:", err);
      setError(err instanceof Error ? err.message : "Auto-tuning failed");
    } finally {
      setTuning(false);
      setTuningProgress(null);
    }
  };

  const saveBestModel = async () => {
    if (!bestModel) {
      alert("No best model to save!");
      return;
    }

    const modelId = `best_model_${Date.now()}`;
    
    try {
      setLoading(true);
      const modelRef = doc(db, `lstm_models/${selectedDataset}/models`, modelId);
      
      await setDoc(modelRef, {
        modelName: bestModel.modelName,
        lookback: bestModel.lookback,
        lstmNeurons: bestModel.lstmNeurons,
        dropout: bestModel.dropout,
        mae: bestModel.mae,
        accuracy: bestModel.accuracy,
        trainedAt: Timestamp.now(),
      });
      
      setBestModel({ ...bestModel, id: modelId });
      alert("Best model saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save model");
      alert("Failed to save model!");
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    if (!bestModel || !bestModel.trainedModel) {
      alert("Please wait for auto-training to complete first!");
      return;
    }

    setForecasting(true);

    try {
      const timeSeriesData = extractTimeSeriesData();
      const { normalized, min, max } = normalizeData(timeSeriesData);
      
      let currentSequence = normalized.slice(-bestModel.lookback);
      const predictions: number[] = [];
      
      for (let i = 0; i < forecastYears; i++) {
        const inputTensor = tf.tensor3d([currentSequence.map(val => [val])]);
        const prediction = bestModel.trainedModel.predict(inputTensor) as tf.Tensor;
        const predValue = (await prediction.data())[0];
        
        predictions.push(predValue);
        currentSequence = [...currentSequence.slice(1), predValue];
        
        inputTensor.dispose();
        prediction.dispose();
      }
      
      const denormalizedPredictions = denormalizeData(predictions, min, max);
      const lastYear = emigrationData[emigrationData.length - 1].Year;
      
      const forecastData = denormalizedPredictions.map((value, index) => ({
        year: lastYear + index + 1,
        predicted: Math.round(value),
        type: 'forecast'
      }));
      
      const recentHistorical = emigrationData.slice(-10).map((yearData, index) => ({
        year: yearData.Year,
        actual: Math.round(timeSeriesData[timeSeriesData.length - 10 + index]),
        type: 'historical'
      }));
      
      // Create combined data with smooth connection
      const lastHistorical = recentHistorical[recentHistorical.length - 1];
      const combined = [
        ...recentHistorical.slice(0, -1).map(h => ({ ...h, predicted: undefined })),
        // Last historical point includes both actual and predicted for smooth connection
        { 
          year: lastHistorical.year, 
          actual: lastHistorical.actual, 
          predicted: lastHistorical.actual, 
          type: 'connection' 
        },
        ...forecastData.map(f => ({ ...f, actual: undefined }))
      ];
      
      setForecastResults({
        forecasts: forecastData,
        historical: recentHistorical,
        combined: combined
      });
      
      console.log("Forecast generated successfully!");
      
    } catch (error) {
      console.error("Forecast error:", error);
      setError(error instanceof Error ? error.message : "Failed to generate forecast");
      alert("Failed to generate forecast!");
    } finally {
      setForecasting(false);
    }
  };

  const exportForecast = () => {
    if (!forecastResults) return;
    
    const csvContent = [
      ['Year', 'Emigrants', 'Type'],
      ...forecastResults.combined
        .filter(row => row.type !== 'connection')
        .map(row => [
          row.year,
          row.actual || row.predicted,
          row.type
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lstm-forecast-${selectedDataset}-${forecastYears}years.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 font-semibold transition-all ${
        activeTab === tab
          ? 'bg-blue-600 text-white border-b-2 border-blue-400'
          : 'bg-secondary text-gray-400 hover:text-white hover:bg-highlights'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            LSTM Forecasting System
          </h1>
          <p className="text-gray-300 text-lg">
            Automatic hyperparameter tuning for optimal emigration prediction
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Dataset Selection */}
        <div className="mb-6 bg-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-6">
            <label className="text-white font-semibold text-lg">Select Dataset:</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as DatasetType)}
              disabled={tuning}
              className="flex-1 max-w-md px-4 py-3 bg-primary border border-gray-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="emigrantData_destination">📍 Destination</option>
              <option value="emigrantData_age">👶 Age</option>
              <option value="emigrantData_civilStatus">💍 Civil Status </option>
              <option value="emigrantData_education">🎓 Education </option>
              <option value="emigrantData_occupation">💼 Occupation </option>
              <option value="emigrantData_province">🗺️ Province </option>
              <option value="emigrantData_sex">⚧️ Sex </option>
            </select>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            {selectedDataset === 'emigrantData_destination' && 'Analyzing emigration trends across different destination countries'}
            {selectedDataset === 'emigrantData_age' && 'Analyzing emigration trends across different age demographics'}
            {selectedDataset === 'emigrantData_civilStatus' && 'Analyzing emigration trends by marital status categories'}
            {selectedDataset === 'emigrantData_education' && 'Analyzing emigration trends by educational attainment levels'}
            {selectedDataset === 'emigrantData_occupation' && 'Analyzing emigration trends across various occupation categories'}
            {selectedDataset === 'emigrantData_province' && 'Analyzing emigration trends by province of origin'}
            {selectedDataset === 'emigrantData_sex' && 'Analyzing emigration trends by gender distribution'}
          </p>
        </div>

        {/* Data Status Banner */}
        <div className="mb-6 bg-secondary rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${dataLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              <p className="text-white">
                {dataLoaded 
                  ? `✓ Loaded ${emigrationData.length} years of data`
                  : "Loading dataset..."}
              </p>
            </div>
            {tuning && (
              <span className="text-yellow-400 font-medium animate-pulse">
                🤖 Auto-training in progress...
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-700">
          <TabButton tab="training" label="Training Progress" />
          <TabButton tab="bestModel" label="Best Model" />
          <TabButton tab="forecast" label="Forecast" />
          <TabButton tab="history" label="Model History" />
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="bg-secondary rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Automatic Hyperparameter Tuning
                </h2>
                
                <div className="bg-primary rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-2">Search Space:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-400">Lookback:</span> {HYPERPARAMETERS.lookback.join(', ')}
                    </div>
                    <div>
                      <span className="text-gray-400">LSTM Neurons:</span> {HYPERPARAMETERS.lstmNeurons.join(', ')}
                    </div>
                    <div>
                      <span className="text-gray-400">Dropout:</span> {HYPERPARAMETERS.dropout.join(', ')}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Total combinations to test: {HYPERPARAMETERS.lookback.length * HYPERPARAMETERS.lstmNeurons.length * HYPERPARAMETERS.dropout.length}
                  </p>
                </div>

                {tuningProgress && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        Training Model {tuningProgress.current} of {tuningProgress.total}
                      </span>
                      <span className="text-blue-300">
                        {Math.round((tuningProgress.current / tuningProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(tuningProgress.current / tuningProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm">
                      Current: {tuningProgress.currentConfig}
                    </p>
                    {tuningProgress.bestSoFar && (
                      <p className="text-green-400 text-sm mt-1">
                        Best so far: {tuningProgress.bestSoFar.config} ({tuningProgress.bestSoFar.accuracy.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                )}

                {autoTrainingComplete && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
                    <p className="text-green-400 font-medium">
                      ✓ Auto-training completed successfully! Check the "Best Model" tab for results.
                    </p>
                  </div>
                )}

                <button
                  onClick={autoTuneModels}
                  disabled={tuning || !dataLoaded || loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {tuning ? "Running Auto-Tune..." : autoTrainingComplete ? "🔄 Re-run Auto-Tuning" : "▶️ Start Auto-Tuning"}
                </button>
              </div>
            </div>
          )}

          {/* Best Model Tab */}
          {activeTab === 'bestModel' && (
            <div className="space-y-6">
              {bestModel ? (
                <div className="bg-secondary rounded-lg p-6 border border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                      🏆 Best Model: {bestModel.modelName}
                    </h2>
                    <button
                      onClick={saveBestModel}
                      disabled={loading || bestModel.id !== undefined}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {bestModel.id ? "✓ Saved" : "Save Model"}
                    </button>
                  </div>

                  {/* Metrics Explanation */}
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-semibold mb-2">📊 Understanding the Metrics:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li><strong>Accuracy:</strong> Percentage of predictions within acceptable range (higher is better)</li>
                      <li><strong>MAE (Mean Absolute Error):</strong> Average difference between predicted and actual emigrants (lower is better)</li>
                      <li><strong>Lookback:</strong> Number of previous years used to predict next year</li>
                      <li><strong>LSTM Neurons:</strong> Model complexity (more neurons = more learning capacity)</li>
                    </ul>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-primary rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-green-400">
                        {bestModel.accuracy?.toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">MAE</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {bestModel.mae?.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Lookback</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {bestModel.lookback} years
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">LSTM Neurons</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {bestModel.lstmNeurons}
                      </div>
                    </div>
                  </div>

                  {/* Test Results Chart */}
                  {bestModel.testResults && (
                    <div className="bg-primary rounded-lg p-4 border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Model Performance on Test Data
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        This chart shows how well the model predicts emigration numbers on unseen data (20% test split). 
                        The closer the green dashed line follows the blue solid line, the better the model performs.
                      </p>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={bestModel.testResults.actual.map((val, idx) => ({
                              index: idx + 1,
                              actual: Math.round(val),
                              predicted: Math.round(bestModel.testResults!.predicted[idx])
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="index" 
                              stroke="#ffffff" 
                              label={{ value: 'Test Sample', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
                            />
                            <YAxis 
                              stroke="#ffffff" 
                              tickFormatter={(value) => value.toLocaleString()}
                              label={{ value: 'Emigrants', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                              formatter={(value: any) => value.toLocaleString()}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} name="Predicted" dot={{ r: 4 }} strokeDasharray="5 5" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-secondary rounded-lg p-12 border border-gray-700 text-center">
                  <p className="text-gray-400 text-lg mb-4">
                    {tuning ? "Training models... Please wait." : "No best model available yet."}
                  </p>
                  {!tuning && (
                    <button
                      onClick={() => setActiveTab('training')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Training
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="bg-secondary rounded-lg p-6 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Generate Future Forecast
                </h3>

                {bestModel ? (
                  <>
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                      <h4 className="text-white font-semibold mb-2">How Forecasting Works:</h4>
                      <p className="text-sm text-gray-300">
                        The best model uses the last {bestModel.lookback} years of historical data to predict future emigration trends. 
                        Each prediction feeds into the next, creating a multi-year forecast up to 10 years ahead.
                      </p>
                    </div>

                    <div className="bg-primary rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-4">
                        <label className="text-white font-medium">Forecast Period:</label>
                        <input
                          type="number"
                          value={forecastYears}
                          onChange={(e) => setForecastYears(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-24 px-3 py-2 bg-secondary border border-gray-600 rounded-lg text-white"
                          min="1"
                          max="10"
                        />
                        <span className="text-gray-400">years (max 10)</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button
                        onClick={generateForecast}
                        disabled={forecasting}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {forecasting ? "Generating..." : "🔮 Generate Forecast"}
                      </button>
                      
                      {forecastResults && (
                        <button
                          onClick={exportForecast}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          📥 Export CSV
                        </button>
                      )}
                    </div>

                    {/* Forecast Results */}
                    {forecastResults && (
                      <div className="space-y-6">
                        {/* Forecast Chart */}
                        <div className="bg-primary rounded-lg p-4 border border-gray-700">
                          <h4 className="text-lg font-semibold text-white mb-2">
                            Historical Data + {forecastYears}-Year Forecast
                          </h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Last 10 years of actual data (blue) combined with predicted future trends (orange)
                          </p>
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={forecastResults.combined}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                  dataKey="year" 
                                  stroke="#ffffff"
                                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
                                />
                                <YAxis 
                                  stroke="#ffffff" 
                                  tickFormatter={(value) => value.toLocaleString()}
                                  label={{ value: 'Emigrants', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    color: "#fff",
                                  }}
                                  formatter={(value: any) => value?.toLocaleString() || 'N/A'}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="actual" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2} 
                                  name="Historical" 
                                  dot={{ r: 4 }}
                                  connectNulls={true}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="predicted" 
                                  stroke="#f97316" 
                                  strokeWidth={2} 
                                  name="Forecast" 
                                  dot={{ r: 4 }} 
                                  strokeDasharray="5 5"
                                  connectNulls={true}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Forecast Table */}
                        <div className="bg-primary rounded-lg p-4 border border-gray-700">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Detailed Forecast Data
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-highlights">
                                  <th className="px-4 py-3 text-left text-white font-semibold">Year</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold">Predicted Emigrants</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold">Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {forecastResults.forecasts.map((forecast, index) => (
                                  <tr key={index} className="border-b border-gray-700">
                                    <td className="px-4 py-3 text-white font-medium">{forecast.year}</td>
                                    <td className="px-4 py-3 text-gray-300">{forecast.predicted.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-orange-900/40 text-orange-300 rounded text-sm">
                                        Forecast
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6 text-center">
                    <p className="text-yellow-300 mb-4">
                      No trained model available for forecasting.
                    </p>
                    <button
                      onClick={() => setActiveTab('training')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Training
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-secondary rounded-lg p-6 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  All Tested Models ({models.length})
                </h3>
                
                {models.length > 0 ? (
                  <>
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-300">
                        This table shows all {models.length} hyperparameter combinations tested during auto-tuning. 
                        Models are ranked by accuracy, with the best performing model at the top.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-highlights">
                            <th className="px-4 py-3 text-left text-white font-semibold">Rank</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Model</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Lookback</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Neurons</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Dropout</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">MAE</th>
                            <th className="px-4 py-3 text-left text-white font-semibold">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {models.map((model, index) => (
                            <tr 
                              key={index} 
                              className={`border-b border-gray-700 ${index === 0 ? 'bg-green-900/20' : ''}`}
                            >
                              <td className="px-4 py-3 text-white">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-300">{model.modelName}</td>
                              <td className="px-4 py-3 text-gray-300">{model.lookback}</td>
                              <td className="px-4 py-3 text-gray-300">{model.lstmNeurons}</td>
                              <td className="px-4 py-3 text-gray-300">{model.dropout}</td>
                              <td className="px-4 py-3 text-gray-300">{model.mae?.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`font-semibold ${
                                  index === 0 ? 'text-green-400' : 
                                  index === 1 ? 'text-blue-400' : 
                                  index === 2 ? 'text-orange-400' : 
                                  'text-gray-300'
                                }`}>
                                  {model.accuracy?.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg mb-4">
                      {tuning ? "Training models... Results will appear here." : "No models trained yet."}
                    </p>
                    {!tuning && (
                      <button
                        onClick={() => setActiveTab('training')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Training
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MachineLearningPage;