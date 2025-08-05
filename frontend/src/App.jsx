import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [processedBlob, setProcessedBlob] = useState(null);

  const [resolution, setResolution] = useState("1920x1080");
  const [applyBlur, setApplyBlur] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const [format, setFormat] = useState("png");
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState({
    resolution: "",
    filters: ""
  });

  const dropRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = "#3498db";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = "#ccc";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = "#ccc";
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileAnalysis(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileAnalysis(e.target.files[0]);
    }
  };

  const handleFileAnalysis = (selectedFile) => {
    setFile(selectedFile);
    const img = new Image();
    const objectUrl = URL.createObjectURL(selectedFile);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      // Suggest resolution based on size & orientation
      let resolutionSuggestion = "";
      let chosenResolution = "";

      if (height > width * 1.2) {
        // Portrait orientation (common for mobiles)
        if (height >= 3200 && width >= 1440) {
          chosenResolution = "1440x3200";
          resolutionSuggestion = "Mobile QHD+ Portrait (1440x3200)";
        } else if (height >= 2532 && width >= 1170) {
          chosenResolution = "1170x2532";
          resolutionSuggestion = "iPhone 13/14 Portrait (1170x2532)";
        } else if (height >= 2778 && width >= 1284) {
          chosenResolution = "1284x2778";
          resolutionSuggestion = "iPhone 14 Pro Max Portrait (1284x2778)";
        } else if (height >= 2400 && width >= 1080) {
          chosenResolution = "1080x2400";
          resolutionSuggestion = "Mobile FHD+ Portrait (1080x2400)";
        } else if (height >= 1920 && width >= 1080) {
          chosenResolution = "1080x1920";
          resolutionSuggestion = "Mobile Full HD Portrait (1080x1920)";
        } else {
          chosenResolution = "720x1280";
          resolutionSuggestion = "Mobile HD Portrait (720x1280) - Image is small";
        }
      } else if (width > height) {
        // Landscape orientation
        if (width <= 2560 && height <= 1440) {
  // mixed range — could be either mobile or desktop
  if (width >= 2400 && height >= 1080) {
    chosenResolution = "2400x1080";
    resolutionSuggestion = "Landscape FHD+ (2400x1080)";
  } else if (width >= 1920 && height >= 1080) {
    chosenResolution = "1920x1080";
    resolutionSuggestion = "Full HD Landscape (1920x1080)";
  } else {
    chosenResolution = "1280x720";
    resolutionSuggestion = "HD Landscape (1280x720)";
  }
} else {
          // Desktop landscape
          if (width >= 3840 && height >= 2160) {
            chosenResolution = "3840x2160";
            resolutionSuggestion = "Desktop 4K (3840x2160)";
          } else if (width >= 2560 && height >= 1440) {
            chosenResolution = "2560x1440";
            resolutionSuggestion = "Desktop QHD (2560x1440)";
          } else if (width >= 1920 && height >= 1080) {
            chosenResolution = "1920x1080";
            resolutionSuggestion = "Desktop Full HD (1920x1080)";
          } else {
            chosenResolution = "1280x720";
            resolutionSuggestion = "Desktop HD (1280x720) - Image is small";
          }
        }
      } else {
        // fallback for square or unknown aspect ratio
        chosenResolution = "1920x1080";
        resolutionSuggestion = "Default resolution (1920x1080)";
      }

      // Always update resolution and suggestions
      setResolution(chosenResolution);

      let filterSuggestion = "";
      if (width < 1000 || height < 1000) {
        setContrast(120);
        setBrightness(110);
        setApplyBlur(false);
        setGrayscale(false);
        filterSuggestion = "Increased contrast (+20%) and brightness (+10%), blur disabled.";
      } else if (width > 3000 && height > 2000) {
        setApplyBlur(true);
        setContrast(100);
        setBrightness(100);
        setGrayscale(false);
        filterSuggestion = "Light blur applied. Default contrast/brightness retained.";
      } else {
        filterSuggestion = "Default filters applied.";
      }

      setSuggestions({
        resolution: resolutionSuggestion,
        filters: filterSuggestion,
      });

      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleUpload = async () => {
  if (!file) return;

  setLoading(true);

  try {
    const originalPreview = URL.createObjectURL(file);
    setOriginalUrl(originalPreview);

    const formData = new FormData();
    formData.append("file", file);

    // No need to send width and height anymore
    formData.append("apply_blur", applyBlur);
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("grayscale", grayscale);
    formData.append("format", format);

    const res = await axios.post("http://127.0.0.1:8000/upload/", formData, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: `image/${format}` });
    setProcessedBlob(blob);

    const processedPreview = URL.createObjectURL(blob);
    setDownloadUrl(processedPreview);
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed. Make sure the backend is running.");
  } finally {
    setLoading(false);
  }
};


  const handleDownload = () => {
    if (!processedBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(processedBlob);
    link.download = `processed_wallpaper.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", maxWidth: 800, margin: "auto" }}>
      <h1>Image to Wallpaper Converter</h1>

      {/* Drag & Drop area */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #ccc",
          padding: "2rem",
          cursor: "pointer",
          marginBottom: "1rem",
          borderRadius: 8,
          color: "#666",
          fontSize: 16,
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? `Selected file: ${file.name}` : "Drag & drop image here, or click to select"}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={loading}
      />

      {/* Suggestions UI */}
      {(suggestions.resolution || suggestions.filters) && (
        <div
          style={{
            marginBottom: "1rem",
            textAlign: "left",
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            maxWidth: 400,
            margin: "1rem auto",
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Suggested Settings</h3>
          {suggestions.resolution && <p><strong>Resolution:</strong> {suggestions.resolution}</p>}
          {suggestions.filters && <p><strong>Filters:</strong> {suggestions.filters}</p>}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: "1rem" }}>
          Resolution:&nbsp;
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            disabled={loading}
          >
            {/* Desktop presets */}
            <optgroup label="Desktop">
              <option value="3840x2160">4K (3840x2160)</option>
              <option value="2560x1440">QHD (2560x1440)</option>
              <option value="1920x1080">Full HD (1920x1080)</option>
              <option value="1280x720">HD (1280x720)</option>
            </optgroup>

            {/* Mobile presets */}
            <optgroup label="Mobile (Portrait)">
              <option value="1440x3200">QHD+ (1440x3200)</option>
              <option value="1170x2532">iPhone 13/14 (1170x2532)</option>
              <option value="1284x2778">iPhone 14 Pro Max (1284x2778)</option>
              <option value="1080x2400">FHD+ (1080x2400)</option>
              <option value="1080x1920">Full HD (1080x1920)</option>
              <option value="720x1280">HD (720x1280)</option>
            </optgroup>
          </select>
        </label>

        <label style={{ marginRight: "1rem" }}>
          Format:&nbsp;
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            disabled={loading}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 20 }}>
          <input
            type="checkbox"
            checked={applyBlur}
            onChange={(e) => setApplyBlur(e.target.checked)}
            disabled={loading}
          />
          &nbsp;Apply Blur
        </label>

        <label style={{ marginRight: 20 }}>
          <input
            type="checkbox"
            checked={grayscale}
            onChange={(e) => setGrayscale(e.target.checked)}
            disabled={loading}
          />
          &nbsp;Grayscale
        </label>
      </div>

      {/* Brightness & Contrast sliders */}
      <div style={{ marginBottom: 20, maxWidth: 400, margin: "auto" }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Brightness: {brightness}%
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            disabled={loading}
            style={{ width: "100%" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Contrast: {contrast}%
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            disabled={loading}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Processing..." : "Convert"}
      </button>

      {loading && (
        <div style={{ marginTop: "1rem" }}>
          <div className="spinner" />
          <p>Processing image, please wait...</p>
        </div>
      )}

      {originalUrl && downloadUrl && !loading && (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>Original Image</h3>
            <img
              src={originalUrl}
              alt="Original"
              style={{ maxWidth: "400px", border: "1px solid gray", borderRadius: 8 }}
            />
          </div>
          <div>
            <h3>Processed Wallpaper</h3>
            <img
              src={downloadUrl}
              alt="Processed"
              style={{ maxWidth: "400px", border: "1px solid gray", borderRadius: 8 }}
            />
            <br />
            <button
              onClick={handleDownload}
              style={{ marginTop: "1rem", cursor: "pointer" }}
            >
              Download Wallpaper
            </button>
          </div>
        </div>
      )}

      {/* Spinner CSS */}
      <style>{`
        .spinner {
          margin: auto;
          border: 6px solid #f3f3f3;
          border-top: 6px solid #3498db;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
