import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc, Timestamp, query, orderBy } from "firebase/firestore";
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
  dataset?: string; // Add dataset field
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

function MachineLearningPage() {
  const [models, setModels] = useState<LSTMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [training, setTraining] = useState<string | null>(null);
  const [emigrationData, setEmigrationData] = useState<EmigrationData[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [selectedDataset, setSelectedDataset] = useState<string>("emigrantData_destination");
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
  const [forecastYears, setForecastYears] = useState(5);
  const [forecasting, setForecasting] = useState(false);
  const [forecastResults, setForecastResults] = useState<ForecastResults | null>(null);

  const availableDatasets = [
    "emigrantData_age",
    "emigrantData_civilStatus",
    "emigrantData_destination",
    "emigrantData_education",
    "emigrantData_occupation",
    "emigrantData_province",
    "emigrantData_sex",
  ];

  // Load emigration data and saved models from Firebase
  useEffect(() => {
    loadEmigrationData();
    loadModels();
  }, [selectedDataset]);

  const loadEmigrationData = async () => {
    try {
      setLoading(true);
      setDataLoaded(false);
      // Load selected dataset
      const q = query(collection(db, selectedDataset), orderBy("Year"));
      const querySnapshot = await getDocs(q);
      
      const data: EmigrationData[] = querySnapshot.docs.map((doc) => doc.data() as EmigrationData);
      setEmigrationData(data);
      setDataLoaded(true);
      console.log(`Loaded ${data.length} years of data from ${selectedDataset}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emigration data");
      console.error("Error loading emigration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      const allModels: LSTMModel[] = [];
      
      // Load models from all dataset subcollections
      for (const dataset of availableDatasets) {
        const querySnapshot = await getDocs(collection(db, "lstm_models", dataset, "models"));
        const datasetModels: LSTMModel[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          modelName: doc.data().modelName,
          lookback: doc.data().lookback,
          lstmNeurons: doc.data().lstmNeurons,
          dropout: doc.data().dropout,
          mae: doc.data().mae,
          accuracy: doc.data().accuracy,
          trained: false, // Set to false since we need to retrain to get the actual model
          trainedAt: doc.data().trainedAt?.toDate(),
          dataset: dataset, // Set the dataset from the subcollection path
        }));
        allModels.push(...datasetModels);
      }
      
      setModels(allModels);
      console.log(`Loaded ${allModels.length} models from database`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
      console.error("Error loading models:", err);
    } finally {
      setLoading(false);
    }
  };

  const addModel = () => {
    const newModel: LSTMModel = {
      modelName: `Model #${models.length + 1}`,
      lookback: 3,
      lstmNeurons: 50,
      dropout: 0.2,
      mae: null,
      accuracy: null,
      trained: false,
    };
    setModels([...models, newModel]);
  };

  const updateModel = (index: number, field: keyof LSTMModel, value: any) => {
    const updated = [...models];
    updated[index] = { ...updated[index], [field]: value };
    setModels(updated);
  };

  // Extract total emigrants per year from the data
  const extractTimeSeriesData = () => {
    const timeSeriesData: number[] = [];
    
    emigrationData.forEach((yearData) => {
      let totalEmigrants = 0;
      
      // Sum all countries for this year
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

  // Normalize data to 0-1 range
  const normalizeData = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalized = data.map(val => (val - min) / (max - min));
    return { normalized, min, max };
  };

  // Denormalize predictions back to original scale
  const denormalizeData = (normalized: number[], min: number, max: number) => {
    return normalized.map(val => val * (max - min) + min);
  };

  // Create sequences for LSTM training
  const createSequences = (data: number[], lookback: number) => {
    const X: number[][] = [];
    const y: number[] = [];
    
    for (let i = lookback; i < data.length; i++) {
      X.push(data.slice(i - lookback, i));
      y.push(data[i]);
    }
    
    return { X, y };
  };

  // Build LSTM model architecture
  const buildLSTMModel = (lookback: number, units: number, dropout: number) => {
    const model = tf.sequential();
    
    // LSTM layer
    model.add(tf.layers.lstm({
      units: units,
      inputShape: [lookback, 1],
      dropout: dropout,
      returnSequences: false
    }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: 1
    }));
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  };

  // Train real LSTM model
  const trainModel = async (index: number) => {
    if (!dataLoaded || emigrationData.length === 0) {
      alert("Emigration data not loaded yet. Please wait...");
      return;
    }

    const modelConfig = models[index];
    setTraining(modelConfig.id || `temp-${index}`);
    setTrainingProgress(0);
    
    try {
      console.log("Starting LSTM training...");
      
      // Extract and normalize time series data
      const timeSeriesData = extractTimeSeriesData();
      console.log(`Time series length: ${timeSeriesData.length}`);
      
      if (timeSeriesData.length < modelConfig.lookback + 10) {
        throw new Error(`Not enough data. Need at least ${modelConfig.lookback + 10} data points.`);
      }
      
      const { normalized, min, max } = normalizeData(timeSeriesData);
      
      // Split into train (80%) and test (20%)
      const splitIndex = Math.floor(normalized.length * 0.8);
      const trainData = normalized.slice(0, splitIndex);
      const testData = normalized.slice(splitIndex);
      
      // Create sequences
      const trainSeq = createSequences(trainData, modelConfig.lookback);
      const testSeq = createSequences(testData, modelConfig.lookback);
      
      console.log(`Train sequences: ${trainSeq.X.length}, Test sequences: ${testSeq.X.length}`);
      
      // Convert to tensors
      const trainX = tf.tensor3d(trainSeq.X.map(seq => seq.map(val => [val])));
      const trainY = tf.tensor2d(trainSeq.y, [trainSeq.y.length, 1]);
      const testX = tf.tensor3d(testSeq.X.map(seq => seq.map(val => [val])));
      const testY = tf.tensor2d(testSeq.y, [testSeq.y.length, 1]);
      
      // Build LSTM model
      const lstmModel = buildLSTMModel(
        modelConfig.lookback,
        modelConfig.lstmNeurons,
        modelConfig.dropout
      );
      
      console.log("Model architecture built. Starting training...");
      
      // Train the model
      const history = await lstmModel.fit(trainX, trainY, {
        epochs: 50,
        batchSize: 8,
        validationData: [testX, testY],
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = ((epoch + 1) / 50) * 100;
            setTrainingProgress(Math.round(progress));
            console.log(`Epoch ${epoch + 1}/50 - loss: ${logs?.loss.toFixed(4)}, val_loss: ${logs?.val_loss.toFixed(4)}`);
          }
        }
      });
      
      // Make predictions on test set
      const predictions = lstmModel.predict(testX) as tf.Tensor;
      const predArray = await predictions.array() as number[][];
      const testYArray = await testY.array() as number[][];
      
      // Denormalize predictions and actual values
      const denormPred = denormalizeData(predArray.map(p => p[0]), min, max);
      const denormActual = denormalizeData(testYArray.map(p => p[0]), min, max);
      
      // Calculate MAE and accuracy
      const mae = denormPred.reduce((sum, pred, i) => sum + Math.abs(pred - denormActual[i]), 0) / denormPred.length;
      
      const percentageErrors = denormPred.map((pred, i) => {
        const error = Math.abs(pred - denormActual[i]) / denormActual[i];
        return Math.max(0, 1 - error);
      });
      const accuracy = (percentageErrors.reduce((sum, acc) => sum + acc, 0) / percentageErrors.length) * 100;
      
      console.log(`Training complete! MAE: ${mae.toFixed(2)}, Accuracy: ${accuracy.toFixed(2)}%`);
      
      // Update model with results
      const updated = [...models];
      updated[index] = {
        ...updated[index],
        mae: parseFloat(mae.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        trained: true,
        trainedModel: lstmModel,
        testResults: {
          actual: denormActual,
          predicted: denormPred
        },
        normalizationParams: { min, max },
        dataset: selectedDataset // Save which dataset was used
      };
      setModels(updated);
      setSelectedModelIndex(index); // Auto-select this model to show results
      
      // Clean up tensors
      trainX.dispose();
      trainY.dispose();
      testX.dispose();
      testY.dispose();
      predictions.dispose();
      
    } catch (err) {
      console.error("Training error:", err);
      setError(err instanceof Error ? err.message : "Training failed");
      alert(err instanceof Error ? err.message : "Training failed");
    } finally {
      setTraining(null);
      setTrainingProgress(0);
    }
  };

  const saveModel = async (index: number) => {
    const modelConfig = models[index];
    
    if (!modelConfig.trained) {
      alert("Please train the model first!");
      return;
    }

    if (!modelConfig.dataset) {
      alert("Model must be trained with a dataset before saving!");
      return;
    }

    // Create a clean ID from the model name
    const cleanId = modelConfig.modelName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, '');     // Remove leading/trailing underscores

    if (!cleanId) {
      alert("Please provide a valid model name!");
      return;
    }

    try {
      setLoading(true);
      
      // Path: lstm_models/{dataset}/models/{modelId}
      const modelPath = `lstm_models/${modelConfig.dataset}/models`;
      const modelRef = doc(db, modelPath, cleanId);
      
      console.log("Saving model to:", modelPath, "/", cleanId); // Debug log
      
      // Check if model already has an ID (already saved)
      if (modelConfig.id) {
        // If the model name changed, we need to handle it differently
        if (modelConfig.id !== cleanId) {
          // Delete old document
          const oldModelRef = doc(db, modelPath, modelConfig.id);
          await deleteDoc(oldModelRef);
          console.log("Deleted old model:", modelConfig.id);
          
          // Create new document with new ID
          await setDoc(modelRef, {
            modelName: modelConfig.modelName,
            lookback: modelConfig.lookback,
            lstmNeurons: modelConfig.lstmNeurons,
            dropout: modelConfig.dropout,
            mae: modelConfig.mae,
            accuracy: modelConfig.accuracy,
            dataset: modelConfig.dataset,
            trainedAt: Timestamp.now(),
          });
          
          console.log("Created new model with ID:", cleanId);
          
          // Update local state with new ID
          const updated = [...models];
          updated[index] = { 
            ...updated[index], 
            id: cleanId, 
            trainedAt: new Date() 
          };
          setModels(updated);
          
          alert("Model renamed and saved successfully!");
        } else {
          // Update existing document
          console.log("Updating existing model in Firebase..."); // Debug log
          await setDoc(modelRef, {
            modelName: modelConfig.modelName,
            lookback: modelConfig.lookback,
            lstmNeurons: modelConfig.lstmNeurons,
            dropout: modelConfig.dropout,
            mae: modelConfig.mae,
            accuracy: modelConfig.accuracy,
            dataset: modelConfig.dataset,
            trainedAt: Timestamp.now(),
          });
          
          // Update trained date
          const updated = [...models];
          updated[index] = { ...updated[index], trainedAt: new Date() };
          setModels(updated);
          
          alert("Model updated successfully!");
        }
      } else {
        // Create new document with custom ID
        console.log("Creating new model in Firebase with ID:", cleanId); // Debug log
        
        // Check if a model with this ID already exists
        const existingDoc = await getDoc(modelRef);
        if (existingDoc.exists()) {
          const overwrite = confirm(
            `A model named "${modelConfig.modelName}" already exists in the ${modelConfig.dataset} dataset. Do you want to overwrite it?`
          );
          if (!overwrite) {
            setLoading(false);
            return;
          }
        }
        
        await setDoc(modelRef, {
          modelName: modelConfig.modelName,
          lookback: modelConfig.lookback,
          lstmNeurons: modelConfig.lstmNeurons,
          dropout: modelConfig.dropout,
          mae: modelConfig.mae,
          accuracy: modelConfig.accuracy,
          dataset: modelConfig.dataset,
          trainedAt: Timestamp.now(),
        });

        console.log("New model created with ID:", cleanId); // Debug log
        
        // Update local state with Firebase ID
        const updated = [...models];
        updated[index] = { 
          ...updated[index], 
          id: cleanId, 
          trainedAt: new Date() 
        };
        setModels(updated);
        
        alert("Model saved successfully!");
      }
    } catch (err) {
      console.error("Save error:", err); // Debug log
      setError(err instanceof Error ? err.message : "Failed to save model");
      alert("Failed to save model: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (index: number) => {
    const modelConfig = models[index];
    
    if (!confirm("Are you sure you want to delete this model?")) {
      return;
    }

    try {
      // Delete from Firebase if it has an ID and dataset
      if (modelConfig.id && modelConfig.dataset) {
        const modelPath = `lstm_models/${modelConfig.dataset}/models`;
        await deleteDoc(doc(db, modelPath, modelConfig.id));
        console.log("Deleted model from Firebase:", modelPath, "/", modelConfig.id);
      }
      
      // Dispose TensorFlow model if exists
      if (modelConfig.trainedModel) {
        modelConfig.trainedModel.dispose();
      }
      
      // Remove from local state
      setModels(models.filter((_, i) => i !== index));
      
      // Clear forecast if this was the selected model
      if (selectedModelIndex === index) {
        setForecastResults(null);
        setSelectedModelIndex(null);
      }
      
      alert("Model deleted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete model");
      alert("Failed to delete model!");
    }
  };

  // Generate LSTM Forecast
  const generateForecast = async () => {
    if (selectedModelIndex === null) {
      alert("Please select a trained model first!");
      return;
    }

    const model = models[selectedModelIndex];

    if (!model.trained || !model.trainedModel) {
      alert("Please train the model first!");
      return;
    }

    if (!model.normalizationParams) {
      alert("Model missing normalization parameters. Please retrain the model.");
      return;
    }

    setForecasting(true);

    try {
      // Extract and normalize historical data
      const timeSeriesData = extractTimeSeriesData();
      const { normalized, min, max } = normalizeData(timeSeriesData);
      
      // Get the last 'lookback' values as the starting point
      let currentSequence = normalized.slice(-model.lookback);
      const predictions: number[] = [];
      
      // Generate forecasts iteratively
      for (let i = 0; i < forecastYears; i++) {
        // Reshape for LSTM input [1, lookback, 1]
        const inputTensor = tf.tensor3d([currentSequence.map(val => [val])]);
        
        // Make prediction
        const prediction = model.trainedModel.predict(inputTensor) as tf.Tensor;
        const predValue = (await prediction.data())[0];
        
        // Store prediction
        predictions.push(predValue);
        
        // Update sequence: remove first value, add prediction
        currentSequence = [...currentSequence.slice(1), predValue];
        
        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();
      }
      
      // Denormalize predictions
      const denormalizedPredictions = denormalizeData(predictions, min, max);
      
      // Get the last year from data
      const lastYear = emigrationData[emigrationData.length - 1].Year;
      
      // Create forecast results
      const forecastData = denormalizedPredictions.map((value, index) => ({
        year: lastYear + index + 1,
        predicted: Math.round(value),
        type: 'forecast'
      }));
      
      // Combine with recent historical data for context
      const recentHistorical = emigrationData.slice(-10).map((yearData, index) => ({
        year: yearData.Year,
        actual: Math.round(timeSeriesData[timeSeriesData.length - 10 + index]),
        type: 'historical'
      }));
      
      setForecastResults({
        forecasts: forecastData,
        historical: recentHistorical,
        combined: [...recentHistorical, ...forecastData]
      });
      
      console.log("Forecast generated successfully!");
      
    } catch (error) {
      console.error("Forecast error:", error);
      setError(error instanceof Error ? error.message : "Failed to generate forecast");
      alert("Failed to generate forecast: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setForecasting(false);
    }
  };

  const exportForecast = () => {
    if (!forecastResults) return;
    
    const csvContent = [
      ['Year', 'Emigrants', 'Type'],
      ...forecastResults.combined.map(row => [
        row.year,
        row.actual || row.predicted,
        row.type
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lstm-forecast-${models[selectedModelIndex!].modelName}-${forecastYears}years.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            LSTM Forecasting (Long Short-Term Memory)
          </h1>
          <p className="text-gray-300 text-lg">
            Train and manage LSTM models for emigration prediction
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Dataset Selection */}
        <div className="mb-6 bg-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">
              Select Dataset for Training:
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-4 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
            >
              {availableDatasets.map((dataset) => (
                <option key={dataset} value={dataset}>
                  {dataset.replace("emigrantData_", "").replace(/([A-Z])/g, " $1").trim()}
                </option>
              ))}
            </select>
            <span className="text-gray-400 text-sm">
              {dataLoaded ? `✓ ${emigrationData.length} years loaded` : "Loading..."}
            </span>
          </div>
        </div>

        {/* Model Configuration Section */}
        <div className="mb-6 bg-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">
              LSTM Model Selection
            </h2>
            <button
              onClick={loadModels}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Loading..." : "↻ Reload from Database"}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-highlights">
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">Model</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">Dataset</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">Lookback</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">LSTM Neurons (Units)</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">Dropout</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">MAE</th>
                  <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20">Accuracy</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((modelConfig, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={modelConfig.modelName}
                        onChange={(e) => updateModel(index, "modelName", e.target.value)}
                        className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-sm">
                        {modelConfig.dataset 
                          ? modelConfig.dataset.replace("emigrantData_", "").replace(/([A-Z])/g, " $1").trim()
                          : "Not trained yet"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={modelConfig.lookback}
                        onChange={(e) => updateModel(index, "lookback", parseInt(e.target.value))}
                        className="w-20 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={modelConfig.lstmNeurons}
                        onChange={(e) => updateModel(index, "lstmNeurons", parseInt(e.target.value))}
                        className="w-24 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.1"
                        value={modelConfig.dropout}
                        onChange={(e) => updateModel(index, "dropout", parseFloat(e.target.value))}
                        className="w-20 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
                        min="0"
                        max="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {modelConfig.mae !== null ? modelConfig.mae.toFixed(2) : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {modelConfig.accuracy !== null ? `${modelConfig.accuracy.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => trainModel(index)}
                          disabled={training === (modelConfig.id || `temp-${index}`)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            modelConfig.trained
                              ? "bg-green-600 text-white"
                              : "bg-highlights text-white hover:bg-highlights/80"
                          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        >
                          {training === (modelConfig.id || `temp-${index}`)
                            ? `Training... ${trainingProgress}%`
                            : modelConfig.trained
                            ? "✓ Trained"
                            : "Train"}
                        </button>
                        <button
                          onClick={() => saveModel(index)}
                          disabled={!modelConfig.trained || loading}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => deleteModel(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Model Button */}
          <div className="mt-4">
            <button
              onClick={addModel}
              className="px-4 py-2 bg-highlights text-white rounded-lg hover:bg-highlights/80 transition-colors font-medium"
            >
              + Add Model Configuration
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">
            About LSTM Models
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>
              • <strong>Dataset:</strong> The emigration dataset used to train the model (age, destination, education, etc.)
            </p>
            <p>
              • <strong>Lookback:</strong> Number of previous time steps to use for prediction
            </p>
            <p>
              • <strong>LSTM Neurons:</strong> Number of units in the LSTM layer (more units = more complex patterns)
            </p>
            <p>
              • <strong>Dropout:</strong> Regularization rate (0.0-1.0) to prevent overfitting
            </p>
            <p>
              • <strong>MAE:</strong> Mean Absolute Error - lower is better
            </p>
            <p>
              • <strong>Accuracy:</strong> Model prediction accuracy percentage
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>💡 Tip:</strong> Models loaded from the database need to be retrained before generating forecasts. 
              Click the "Train" button to rebuild the model with the saved configuration.
            </p>
          </div>
        </div>

        {/* Performance Metrics and Testing Results */}
        {selectedModelIndex !== null && models[selectedModelIndex]?.trained && models[selectedModelIndex]?.testResults && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white">
                LSTM Model Performance Metrics - {models[selectedModelIndex].modelName}
              </h3>
              <select
                value={selectedModelIndex}
                onChange={(e) => setSelectedModelIndex(parseInt(e.target.value))}
                className="px-4 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
              >
                {models.map((m, idx) => m.trained && (
                  <option key={idx} value={idx}>{m.modelName}</option>
                ))}
              </select>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-primary rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Mean Absolute Error</div>
                <div className="text-2xl font-bold text-highlights">
                  {models[selectedModelIndex].mae?.toLocaleString()}
                </div>
              </div>
              <div className="bg-primary rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-400">
                  {models[selectedModelIndex].accuracy?.toFixed(2)}%
                </div>
              </div>
              <div className="bg-primary rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Test Samples</div>
                <div className="text-2xl font-bold text-blue-400">
                  {models[selectedModelIndex].testResults.actual.length}
                </div>
              </div>
              <div className="bg-primary rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Train/Test Split</div>
                <div className="text-2xl font-bold text-purple-400">
                  80/20
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-primary rounded-lg p-4 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Testing Results - 20% Split (Actual vs Predicted)
              </h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={models[selectedModelIndex].testResults.actual.map((val, idx) => ({
                      index: idx + 1,
                      actual: Math.round(val),
                      predicted: Math.round(models[selectedModelIndex].testResults!.predicted[idx])
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="index" 
                      stroke="#ffffff"
                      label={{ value: 'Test Sample', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
                    />
                    <YAxis 
                      stroke="#ffffff"
                      label={{ value: 'Emigrants', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                      tickFormatter={(value) => value.toLocaleString()}
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
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Actual"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Predicted"
                      dot={{ r: 4 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 bg-primary rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-2">Model Configuration</h4>
              <div className="grid grid-cols-4 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-gray-400">Lookback:</span> {models[selectedModelIndex].lookback}
                </div>
                <div>
                  <span className="text-gray-400">LSTM Neurons:</span> {models[selectedModelIndex].lstmNeurons}
                </div>
                <div>
                  <span className="text-gray-400">Dropout:</span> {models[selectedModelIndex].dropout}
                </div>
                <div>
                  <span className="text-gray-400">Trained:</span> {models[selectedModelIndex].trainedAt?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LSTM Forecast Generator Section */}
        {selectedModelIndex !== null && models[selectedModelIndex]?.trained && (
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Generate LSTM Forecast - {models[selectedModelIndex].modelName}
            </h3>

            {/* Forecast Controls */}
            <div className="bg-primary rounded-lg p-4 border border-gray-700 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white font-medium">
                  Forecast Period:
                </label>
                <input
                  type="number"
                  value={forecastYears}
                  onChange={(e) => setForecastYears(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 bg-secondary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlights"
                  min="1"
                  max="20"
                />
                <span className="text-gray-400">years into the future</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generateForecast}
                  disabled={forecasting || !models[selectedModelIndex].trained}
                  className="px-6 py-2 bg-highlights text-white rounded-lg hover:bg-highlights/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {forecasting ? "Generating Forecast..." : "Generate Forecast"}
                </button>
                
                {forecastResults && (
                  <button
                    onClick={exportForecast}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Export to CSV
                  </button>
                )}
              </div>
            </div>

            {/* Forecast Results */}
            {forecastResults && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Forecast Period</div>
                    <div className="text-2xl font-bold text-highlights">
                      {forecastYears} Years
                    </div>
                  </div>
                  <div className="bg-primary rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Average Forecast</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.round(
                        forecastResults.forecasts.reduce((sum, f) => sum + f.predicted, 0) / 
                        forecastResults.forecasts.length
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-primary rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Peak Year</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {forecastResults.forecasts.reduce((max, f) => 
                        f.predicted > max.predicted ? f : max
                      ).year}
                    </div>
                  </div>
                  <div className="bg-primary rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Trend</div>
                    <div className="text-2xl font-bold text-green-400">
                      {forecastResults.forecasts[forecastResults.forecasts.length - 1].predicted > 
                       forecastResults.forecasts[0].predicted ? "↑ Rising" : "↓ Declining"}
                    </div>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="bg-primary rounded-lg p-4 border border-gray-700 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Historical Data & LSTM Forecast
                  </h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecastResults.combined}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#ffffff"
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
                        />
                        <YAxis 
                          stroke="#ffffff"
                          label={{ value: 'Emigrants', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                          tickFormatter={(value) => value.toLocaleString()}
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
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Historical"
                          dot={{ r: 4 }}
                          connectNulls
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          name="Forecast"
                          dot={{ r: 5 }}
                          strokeDasharray="5 5"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Forecast Data Table */}
                <div className="bg-primary rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Detailed Forecast Results
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-highlights">
                          <th className="px-4 py-3 text-left text-white font-semibold">Year</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Predicted Emigrants</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Change from Previous</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastResults.forecasts.map((forecast, idx) => {
                          const prevValue = idx === 0 
                            ? forecastResults.historical[forecastResults.historical.length - 1].actual
                            : forecastResults.forecasts[idx - 1].predicted;
                          const change = forecast.predicted - prevValue;
                          const changePercent = (change / prevValue) * 100;
                          
                          return (
                            <tr key={forecast.year} className="border-b border-gray-700">
                              <td className="px-4 py-3 text-white font-medium">{forecast.year}</td>
                              <td className="px-4 py-3 text-gray-300">
                                {forecast.predicted.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={change >= 0 ? "text-red-400" : "text-green-400"}>
                                  {change >= 0 ? "+" : ""}{change.toLocaleString()} 
                                  ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}