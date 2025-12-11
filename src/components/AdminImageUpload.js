import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import "./AdminImageUpload.css";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api/images"
      : "https://node.egschitfund.com/api/images",
});

export default function AdminImageUpload() {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0)
        return alert("Please select images first!");

      const newImages = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          data: await toBase64(file),
        }))
      );

      const res = await api.post("/upload", { images: newImages });
      setImages([...images, ...res.data]);
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleDelete = async (index, id) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);

    if (id) {
      await api.delete(`/${id}`);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
  };

  const handleUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const updated = [...images];
    const old = updated[editIndex];

    const res = await api.put(`/${old._id}`, {
      name: file.name,
      data: await toBase64(file),
    });

    updated[editIndex] = res.data;
    setImages(updated);
    setEditIndex(null);
  };

  const fetchImages = async () => {
    const res = await api.get("/");
    setImages(res.data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content-container">
        <h2 className="page-title">📸 Slider Images</h2>

        <div className="upload-box">
          <button
            className="add-image-btn"
            onClick={() => document.getElementById("file-upload").click()}
          >
            ➕ Add Image
          </button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {selectedFiles.length > 0 && (
          <button className="upload-btn" onClick={handleUpload}>
            ⬆️ Upload Selected ({selectedFiles.length})
          </button>
        )}

        <button className="refresh-btn" onClick={fetchImages}>
          🔄 Refresh Images
        </button>

        <div className="image-gallery">
          {images.length === 0 ? (
            <p className="no-images">No images uploaded yet</p>
          ) : (
            images.map((img, index) => (
              <div key={img._id || index} className="image-card">
                <img src={img.data} alt={img.name} className="preview-img" />
                <p className="image-name">{img.name}</p>
                <div className="btn-group">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(index, img._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {editIndex === index && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpdate}
                    className="update-input"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
