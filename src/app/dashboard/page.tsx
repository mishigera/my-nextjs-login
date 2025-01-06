'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [photos, setPhotos] = useState<{ id: number; src: string; name: string }[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [resizeDimensions, setResizeDimensions] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/images/images', {
          headers: {
            'Authorization': `${localStorage.getItem('token')}`,
          }
        });
        const uploadedImages = response.data.map((image: any) => ({
          id: image.id,
          src: `${image.url}`,
          name: image.url.split('/').pop(),
        }));
        setPhotos(uploadedImages);
      } catch (error:any) {
        const response = await axios.get('http://localhost:5001/api/images/images', {
          headers: {
            'Authorization': `${localStorage.getItem('token')}`,
          }
        });
      if(error.response && error.response.status === 401){
            Swal.fire({
            icon: 'warning',
            title: 'No autorizado',
            text: 'Por favor inicie sesión.',
          }).then(() => {
            // Eliminar datos de localStorage
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
          
            // Redirigir después de que el Swal se cierre
            window.location.href = '/';
          });
        }
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const resizedFiles = await Promise.all(Array.from(files).map(resizeImage));

      const formData = new FormData();
      resizedFiles.forEach((file) => {
        formData.append('image', file);
      });
      formData.append('user_id', localStorage.getItem('user_id') || '');

      try {
        const response = await axios.post('http://localhost:5001/api/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${localStorage.getItem('token')}`,
          },
        });

        const response2 = await axios.get('http://localhost:5001/api/images/images', {
          headers: {
            'Authorization': `${localStorage.getItem('token')}`,
          }
        });
        const uploadedImages = response2.data.map((image: any) => ({
          id: image.id,
          src: `${image.url}`,
          name: image.url.split('/').pop(),
        }));
        setPhotos(uploadedImages);
        Swal.fire('Imagen subida con éxito');
      } catch (error:any) {
        console.error('Error uploading images:', error);
        if(error.response && error.response.status === 401){
          Swal.fire({
            icon: 'warning',
            title: 'No autorizado',
            text: 'Por favor inicie sesión.',
          }).then(() => {
            // Eliminar datos de localStorage
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
          
            // Redirigir después de que el Swal se cierre
            window.location.href = '/';
          });
        }
      }
    }
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = resizeDimensions.width;
        canvas.height = resizeDimensions.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          }
        }, file.type);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleResizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResizeDimensions({ ...resizeDimensions, [name]: parseInt(value, 10) });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="relative bg-gray-200 text-center py-8">
        <h1 className="text-3xl font-bold text-gray-800">Photo Upload</h1>
        <label
          htmlFor="file-upload"
          className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition cursor-pointer"
        >
          Upload Photos
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Resize Options */}
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Resize Options
          </label>
          <input
            type="number"
            name="width"
            value={resizeDimensions.width}
            onChange={handleResizeChange}
            placeholder="Width"
            className="mr-2 p-2 border rounded"
          />
          <input
            type="number"
            name="height"
            value={resizeDimensions.height}
            onChange={handleResizeChange}
            placeholder="Height"
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(photo.src)}
          >
            <img src={photo.src} alt={photo.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-700">{photo.name}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Image Preview</h2>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-black"
              >
                ✖️
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Antes</h3>
                <img
                  src={selectedPhoto}
                  alt="Antes"
                  className="w-full h-64 object-contain border"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Después</h3>
                <img
                  src={selectedPhoto}
                  alt="Después"
                  className="w-full h-64 object-contain border"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
