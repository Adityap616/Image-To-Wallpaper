# 🖼️ Smart Image-to-Wallpaper Converter

A full-stack image converter that transforms any uploaded image into a perfectly sized desktop or mobile wallpaper — with smart resolution suggestions and optional enhancements like blur, contrast, brightness, and grayscale.

> Built using **React** (frontend), **FastAPI** + **Pillow** (backend).

---

## 🚀 Features

- 📐 **Auto Orientation Detection**  
  Detects portrait or landscape orientation using image dimensions and EXIF data.

- 🎯 **Smart Resolution Suggestions**  
  Automatically suggests optimized resolutions:
  - Desktop (4K, QHD, Full HD, HD)
  - Mobile (QHD+, FHD+, iPhone presets)

- 🎨 **Image Enhancements (Optional)**
  - Apply blur
  - Adjust brightness and contrast
  - Apply grayscale filter

- 🖥️ **Responsive & Intuitive UI**
  - Drag & drop image upload
  - Live previews (original and processed)
  - Download the optimized wallpaper

- 📦 **Output Options**
  - Choose between PNG, JPEG, or WEBP formats
  - Resolution presets for manual override

---

## 📸 Demo

![App Demo](demo.gif) <!-- Replace with your own GIF or screenshot -->

---

## 🧰 Tech Stack

| Frontend | Backend | Image Processing |
|----------|---------|------------------|
| React    | FastAPI | Pillow (PIL)     |
