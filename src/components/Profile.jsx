import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Edit2 } from 'lucide-react';

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    bankAccounts: [],
    customCategories: []
  });
  const [newBank, setNewBank] = useState({ name: '', accountNumber: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfileData(data.profile);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    }
  };

  const handleAddBank = () => {
    if (newBank.name && newBank.accountNumber) {
      setProfileData({
        ...profileData,
        bankAccounts: [...profileData.bankAccounts, newBank]
      });
      setNewBank({ name: '', accountNumber: '' });
      setShowBankForm(false);
    }
  };

  const handleRemoveBank = (index) => {
    const updatedBanks = profileData.bankAccounts.filter((_, i) => i !== index);
    setProfileData({ ...profileData, bankAccounts: updatedBanks });
  };

  const handleAddCategory = () => {
    if (newCategory) {
      setProfileData({
        ...profileData,
        customCategories: [...profileData.customCategories, newCategory]
      });
      setNewCategory('');
      setShowCategoryForm(false);
    }
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = profileData.customCategories.filter((_, i) => i !== index);
    setProfileData({ ...profileData, customCategories: updatedCategories });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20D982]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
      <div className="bg-[#280832] rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-[#20D982]/10 text-[#20D982] rounded-full hover:bg-[#20D982] hover:text-black transition-all duration-300"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Bank Accounts</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowBankForm(true)}
                  className="flex items-center gap-1 text-[#20D982] hover:text-[#1aaf6a]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bank</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.bankAccounts.map((bank, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-white">{bank.name}</p>
                    <p className="text-gray-400 text-sm">****{bank.accountNumber.slice(-4)}</p>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBank(index)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {showBankForm && (
              <div className="space-y-3 p-4 bg-black/20 rounded-lg">
                <div>
                  <label className="block text-gray-400 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={newBank.name}
                    onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBankForm(false)}
                    className="px-3 py-1 text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBank}
                    className="px-3 py-1 bg-[#20D982]/10 text-[#20D982] rounded-lg hover:bg-[#20D982] hover:text-black"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Custom Categories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Custom Categories</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center gap-1 text-[#20D982] hover:text-[#1aaf6a]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.customCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full"
                >
                  <span className="text-white">{category}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {showCategoryForm && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/20 text-white border border-gray-700 focus:border-[#20D982] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-3 py-2 text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-[#20D982]/10 text-[#20D982] rounded-lg hover:bg-[#20D982] hover:text-black"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#20D982] text-black rounded-lg hover:bg-[#1aaf6a] transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile; 