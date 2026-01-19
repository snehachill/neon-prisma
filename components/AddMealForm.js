"use client";

import { useState } from "react";
import {
  Plus,
  Clock,
  Utensils,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

export default function AddMealForm({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "BREAKFAST",
    date: "",
    imgURL: "",
    ingredients: [{ itemName: "", gramsPerPax: "" }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
  };

  const addIngredientField = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { itemName: "", gramsPerPax: "" }],
    }));
  };

  const removeIngredientField = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.title || !formData.date) {
        setError("Title and Date are required");
        setLoading(false);
        return;
      }

      // Validate ingredients
      const validIngredients = formData.ingredients.filter(
        (ing) => ing.itemName.trim() && ing.gramsPerPax
      );

      if (validIngredients.length === 0) {
        setError("At least one ingredient is required");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          date: formData.date,
          imgURL:
            formData.imgURL ||
            "https://eduauraapublic.s3.ap-south-1.amazonaws.com/webassets/images/blogs/indian-food-nutrition.jpg",
          ingredients: validIngredients,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meal");
      }

      setSuccess(true);
      setFormData({
        title: "",
        type: "BREAKFAST",
        date: "",
        imgURL: "",
        ingredients: [{ itemName: "", gramsPerPax: "" }],
      });

      // Call callback and close after success
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-orange-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Meal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-900">Success!</h3>
                <p className="text-sm text-emerald-800">
                  Meal created successfully
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meal Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Aloo Paratha & Curd"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meal Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="BREAKFAST">🍳 Breakfast</option>
                  <option value="LUNCH">🍽️ Lunch</option>
                  <option value="DINNER">🌙 Dinner</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imgURL"
                  value={formData.imgURL}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Ingredients
            </h3>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={ingredient.itemName}
                      onChange={(e) =>
                        handleIngredientChange(index, "itemName", e.target.value)
                      }
                      placeholder="e.g., Rice, Dal, Tomato"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grams/Person
                    </label>
                    <input
                      type="number"
                      value={ingredient.gramsPerPax}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          "gramsPerPax",
                          e.target.value
                        )
                      }
                      placeholder="150"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                    />
                  </div>
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientField(index)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredientField}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border-2 border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>

          {/* Buttons */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Created!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Meal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
