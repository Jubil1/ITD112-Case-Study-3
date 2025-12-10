import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineTable,
  AiOutlineClose,
  AiOutlineCheck,
  AiOutlineWarning,
} from "react-icons/ai";
import {
  getAllData,
  postDataToFirestore,
  updateDataByYear,
  deleteDataByYear,
  getCategories,
} from "../api/baseService";

export const Route = createFileRoute("/crud")({
  component: CRUDPage,
});

type DataCollection =
  | "emigrantData_destination"
  | "emigrantData_age"
  | "emigrantData_sex"
  | "emigrantData_civilStatus"
  | "emigrantData_education"
  | "emigrantData_occupation"
  | "emigrantData_province";

interface DataRow {
  Year: number;
  [key: string]: any;
}

function CRUDPage() {
  const [selectedCollection, setSelectedCollection] =
    useState<DataCollection>("emigrantData_destination");
  const [data, setData] = useState<DataRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);

  // Form states
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formData, setFormData] = useState<Record<string, number>>({});

  const collections: { value: DataCollection; label: string }[] = [
    { value: "emigrantData_destination", label: "Destination Countries" },
    { value: "emigrantData_age", label: "Age Groups" },
    { value: "emigrantData_sex", label: "Gender/Sex" },
    { value: "emigrantData_civilStatus", label: "Civil Status" },
    { value: "emigrantData_education", label: "Education Level" },
    { value: "emigrantData_occupation", label: "Occupation" },
    { value: "emigrantData_province", label: "Province/Origin" },
  ];

  useEffect(() => {
    loadData();
  }, [selectedCollection]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await getAllData(selectedCollection);
      setData(result);

      if (result.length > 0) {
        const cats = await getCategories(selectedCollection);
        setCategories(cats.filter((c) => c !== "Year"));
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    try {
      if (!formYear || formYear < 1900 || formYear > 2100) {
        throw new Error("Please enter a valid year");
      }

      if (Object.keys(formData).length === 0) {
        throw new Error("Please add at least one category with a value");
      }

      // Check if year already exists
      if (data.some((row) => row.Year === formYear)) {
        throw new Error(
          `Year ${formYear} already exists. Use Edit instead.`
        );
      }

      await postDataToFirestore(selectedCollection, formYear, formData);
      setSuccess(`Successfully created record for year ${formYear}`);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create record"
      );
    }
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");
    try {
      if (!selectedRow) return;

      if (Object.keys(formData).length === 0) {
        throw new Error("Please provide at least one value to update");
      }

      await updateDataByYear(selectedCollection, selectedRow.Year, formData);
      setSuccess(`Successfully updated record for year ${selectedRow.Year}`);
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update record"
      );
    }
  };

  const handleDelete = async () => {
    setError("");
    setSuccess("");
    try {
      if (!selectedRow) return;

      await deleteDataByYear(selectedCollection, selectedRow.Year);
      setSuccess(`Successfully deleted record for year ${selectedRow.Year}`);
      setShowDeleteModal(false);
      setSelectedRow(null);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete record"
      );
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (row: DataRow) => {
    setSelectedRow(row);
    setFormYear(row.Year);
    const rowData: Record<string, number> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (key !== "Year" && typeof value === "number") {
        rowData[key] = value;
      } else if (key !== "Year" && typeof value === "object" && value?.emigrants) {
        rowData[key] = value.emigrants;
      }
    });
    setFormData(rowData);
    setShowEditModal(true);
  };

  const openDeleteModal = (row: DataRow) => {
    setSelectedRow(row);
    setShowDeleteModal(false);
    setTimeout(() => setShowDeleteModal(true), 0);
  };

  const resetForm = () => {
    setFormYear(new Date().getFullYear());
    setFormData({});
    setSelectedRow(null);
  };

  const addCategory = () => {
    const categoryName = prompt("Enter category name:");
    if (categoryName && categoryName.trim()) {
      setFormData({ ...formData, [categoryName.trim().toUpperCase()]: 0 });
    }
  };

  const updateCategory = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, [key]: numValue });
    }
  };

  const removeCategory = (key: string) => {
    const newData = { ...formData };
    delete newData[key];
    setFormData(newData);
  };

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Data Management (CRUD)
          </h1>
          <p className="text-gray-300 text-lg">
            Create, Read, Update, and Delete emigrant data records
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AiOutlineWarning className="text-red-400 text-2xl flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AiOutlineCheck className="text-green-400 text-2xl flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Data Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) =>
                  setSelectedCollection(e.target.value as DataCollection)
                }
                className="w-full bg-primary text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-highlights"
              >
                {collections.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-highlights text-white px-6 py-2 rounded-lg hover:bg-highlights/90 transition-colors whitespace-nowrap"
            >
              <AiOutlinePlus className="text-xl" />
              Create New Record
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-secondary rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                Loading data...
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center">
                <AiOutlineTable className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No data available</p>
                <p className="text-gray-500 text-sm">
                  Create a new record to get started
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-primary">
                  <tr>
                    <th className="text-left px-6 py-4 text-white font-semibold border-b border-gray-700">
                      Year
                    </th>
                    {categories.slice(0, 5).map((cat) => (
                      <th
                        key={cat}
                        className="text-left px-6 py-4 text-white font-semibold border-b border-gray-700"
                      >
                        {cat}
                      </th>
                    ))}
                    {categories.length > 5 && (
                      <th className="text-left px-6 py-4 text-white font-semibold border-b border-gray-700">
                        ... +{categories.length - 5} more
                      </th>
                    )}
                    <th className="text-right px-6 py-4 text-white font-semibold border-b border-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={row.Year}
                      className={`${
                        index % 2 === 0 ? "bg-secondary" : "bg-primary/50"
                      } hover:bg-primary/80 transition-colors`}
                    >
                      <td className="px-6 py-4 text-white font-medium border-b border-gray-700/50">
                        {row.Year}
                      </td>
                      {categories.slice(0, 5).map((cat) => {
                        const value =
                          typeof row[cat] === "object" && row[cat]?.emigrants
                            ? row[cat].emigrants
                            : row[cat];
                        return (
                          <td
                            key={cat}
                            className="px-6 py-4 text-gray-300 border-b border-gray-700/50"
                          >
                            {typeof value === "number"
                              ? value.toLocaleString()
                              : "-"}
                          </td>
                        );
                      })}
                      {categories.length > 5 && (
                        <td className="px-6 py-4 text-gray-400 italic border-b border-gray-700/50">
                          {categories.length - 5} more fields
                        </td>
                      )}
                      <td className="px-6 py-4 text-right border-b border-gray-700/50">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(row)}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            title="Edit"
                          >
                            <AiOutlineEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(row)}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                            title="Delete"
                          >
                            <AiOutlineDelete className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Data Count */}
        {data.length > 0 && (
          <div className="mt-4 text-gray-400 text-sm">
            Showing {data.length} record{data.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          title="Create New Record"
          onClose={() => setShowCreateModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year *
              </label>
              <input
                type="number"
                value={formYear}
                onChange={(e) => setFormYear(parseInt(e.target.value))}
                className="w-full bg-primary text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-highlights"
                placeholder="e.g., 2024"
                min="1900"
                max="2100"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Data Fields
                </label>
                <button
                  onClick={addCategory}
                  className="text-highlights hover:text-highlights/80 text-sm flex items-center gap-1"
                >
                  <AiOutlinePlus /> Add Field
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.keys(formData).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="mb-2">No fields added yet</p>
                    <button
                      onClick={addCategory}
                      className="text-highlights hover:underline"
                    >
                      Click to add a field
                    </button>
                  </div>
                ) : (
                  Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        disabled
                        className="flex-1 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg px-4 py-2"
                      />
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => updateCategory(key, e.target.value)}
                        className="w-32 bg-primary text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-highlights"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removeCategory(key)}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                      >
                        <AiOutlineClose />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-highlights text-white rounded-lg hover:bg-highlights/90 transition-colors"
              >
                Create Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRow && (
        <Modal
          title={`Edit Record - Year ${selectedRow.Year}`}
          onClose={() => setShowEditModal(false)}
        >
          <div className="space-y-4">
            <div className="bg-primary/50 border border-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">
                Year: <span className="text-white font-semibold">{formYear}</span>
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Update Data Fields
                </label>
                <button
                  onClick={addCategory}
                  className="text-highlights hover:text-highlights/80 text-sm flex items-center gap-1"
                >
                  <AiOutlinePlus /> Add Field
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      disabled
                      className="flex-1 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg px-4 py-2"
                    />
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateCategory(key, e.target.value)}
                      className="w-32 bg-primary text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-highlights"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCategory(key)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                    >
                      <AiOutlineClose />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-highlights text-white rounded-lg hover:bg-highlights/90 transition-colors"
              >
                Update Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRow && (
        <Modal
          title="Confirm Delete"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <AiOutlineWarning className="text-red-500 text-3xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-white mb-2">
                  Are you sure you want to delete the record for year{" "}
                  <span className="font-bold">{selectedRow.Year}</span>?
                </p>
                <p className="text-gray-400 text-sm">
                  This action cannot be undone. All data for this year will be
                  permanently removed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <AiOutlineClose className="text-2xl" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
