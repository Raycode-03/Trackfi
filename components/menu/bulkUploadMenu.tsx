'use client';
import React, { useState } from 'react';
import { Upload, Download, X, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateMenuItem } from '@/types';
import { adminMenuApi } from '@/lib/api';

interface ParsedMenuItem extends CreateMenuItem {
  rowNumber: number;
}

interface CSVRow {
  [key: string]: string;
}

export default function BulkUploadMenu() {
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMenuItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const bulkUploadMutation = useMutation({
    mutationFn: (items: CreateMenuItem[]) => adminMenuApi.bulkUploadMenus(items),
    onSuccess: ( variables ) => {
      toast.success(`Successfully added ${variables.length} items!`);
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      
      // Reset form
      setShowUpload(false);
      setFile(null);
      setParsedData([]);
      setErrors([]);
    },
    onError: (error: Error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    const text = await selectedFile.text();
    parseCSV(text);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('CSV file is empty');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: ParsedMenuItem[] = [];
    const newErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validation
      if (!row.name) {
        newErrors.push(`Row ${i + 1}: Missing name`);
      }
      if (!row.price || isNaN(parseFloat(row.price))) {
        newErrors.push(`Row ${i + 1}: Invalid price "${row.price}"`);
      }
      if (!row.category) {
        newErrors.push(`Row ${i + 1}: Missing category`);
      }

      const item: ParsedMenuItem = {
        rowNumber: i + 1,
        name: row.name,
        description: row.description || '',
        price: parseFloat(row.price) || 0,
        category: row.category,
        image_url: row.image_url || '',
        video_url: row.video_url || '',
        is_veg: row.is_veg === 'true',
        is_vegan: row.is_vegan === 'true',
        is_available: row.is_available !== 'false'
      };

      data.push(item);
    }

    setParsedData(data);
    setErrors(newErrors);
  };

  const handleBulkUpload = async () => {
    if (errors.length > 0) {
      toast.error('Please fix errors in your CSV file first');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    // Show loading toast
    toast.loading(`Uploading ${parsedData.length} items...`, {
      id: 'bulk-upload',
    });

    const items: CreateMenuItem[] = parsedData.map(item => ({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      is_veg: item.is_veg,
      is_vegan: item.is_vegan,
      is_available: item.is_available
    }));

    // Trigger mutation
    bulkUploadMutation.mutate(items, {
      onSettled: () => {
        // Dismiss loading toast on success or error
        toast.dismiss('bulk-upload');
      },
    });
  };

  const downloadTemplate = () => {
    const template = `name,description,price,category,image_url,video_url,is_veg,is_vegan,is_available
Jollof Rice,Spicy Nigerian jollof rice with chicken,2500,Main Course,,,false,false,true
Fried Rice,Fried rice with vegetables and shrimp,2000,Main Course,,,false,false,true
Suya,Grilled spicy meat skewers,1500,Appetizer,,,false,false,true
Pounded Yam,Fresh pounded yam with egusi soup,3000,Main Course,,,false,false,true
Chapman,Refreshing fruit cocktail,800,Beverages,,,true,true,true`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_items_template.csv';
    a.click();
  };
  return (
    <div className="mb-6">
      {/* Upload Button */}
      {!showUpload && (
        <button
          onClick={() => setShowUpload(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Add Items (CSV)
        </button>
      )}

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Upload Menu Items</h2>
            <button 
              onClick={() => setShowUpload(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
              <li>Download the Excel template below</li>
              <li>Fill in your menu items</li>
              <li>Save and upload the CSV file</li>
              <li>You can add Cloudinary image links in the Excel file, or add images later by editing each item</li>
            </ol>
          </div>

          {/* Download Template */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={downloadTemplate}
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Excel Template
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer block"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {file ? `Selected: ${file.name}` : 'Click anywhere to upload your CSV file'}
              </p>
            </label>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    Found {errors.length} error(s):
                  </h3>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && parsedData.length > 0 && errors.length === 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleBulkUpload}
                disabled={bulkUploadMutation.isPending || errors.length > 0}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {bulkUploadMutation.isPending ? 'Uploading...' : `Upload ${parsedData.length} Items`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}