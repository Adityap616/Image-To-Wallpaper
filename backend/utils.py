from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import os

OUTPUT_PATH_BASE = "processed/wallpaper"

async def process_image(
    uploaded_file,
    resolution_landscape=(1920, 1080),
    resolution_portrait=(1080, 1920),
    apply_blur=True,
    brightness=100,
    contrast=100,
    grayscale=False,
    fmt="png"
):
    # Load image and fix EXIF orientation
    img = Image.open(uploaded_file.file)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")  # Ensure uniform format

    # Determine orientation
    width, height = img.size
    aspect_ratio = width / height

    if aspect_ratio < 0.9:
        orientation = "portrait"
        target_resolution = resolution_portrait
    else:
        orientation = "landscape"
        target_resolution = resolution_landscape

    # Resize while preserving aspect ratio and padding/cropping if needed
    img = img.resize(target_resolution, Image.Resampling.LANCZOS)

    # Optional blur
    if apply_blur:
        img = img.filter(ImageFilter.GaussianBlur(radius=1))

    # Brightness adjustment
    if brightness != 100:
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(brightness / 100)

    # Contrast adjustment
    if contrast != 100:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(contrast / 100)

    # Grayscale (if enabled)
    if grayscale:
        img = img.convert("L").convert("RGB")

    # Save processed image
    os.makedirs("processed", exist_ok=True)
    output_path = f"{OUTPUT_PATH_BASE}.{fmt.lower()}"

    save_kwargs = {"quality": 95, "optimize": True}
    if fmt.lower() in ["jpeg", "jpg"]:
        save_kwargs["progressive"] = True
    elif fmt.lower() == "png":
        save_kwargs["compress_level"] = 1

    img.save(output_path, fmt.upper(), **save_kwargs)

    return output_path
