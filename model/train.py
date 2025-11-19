import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
import os
import subprocess
import json
import sys
from pathlib import Path

# Paths (resolve relative to this script so calling from project root works)
BASE_DIR = Path(__file__).resolve().parent
dataset_path = str((BASE_DIR.parent / 'pages' / 'gesture' / 'dataset').resolve())
save_model_path = str((BASE_DIR.parent / 'pages' / 'gesture' / 'model').resolve())

# Image settings (resize to 64x64 for lightweight model)
img_height, img_width = 64, 64
batch_size = 16

# Training hyperparameters
EPOCHS = 10

os.makedirs(save_model_path, exist_ok=True)

# Data loading & preprocessing (simple augmentation)
datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
    validation_split=0.2,
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.08
)

train_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode="categorical",
    subset="training"
)

val_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode="categorical",
    subset="validation"
)

# Model definition (small CNN)
num_classes = len(train_data.class_indices)
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation="relu", input_shape=(img_height, img_width, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation="relu"),
    layers.Dense(num_classes, activation="softmax")
])

model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

print(f"Starting training: classes={num_classes}, epochs={EPOCHS}")
history = model.fit(train_data, validation_data=val_data, epochs=EPOCHS)

# Save Keras model (will be converted to TFJS)
keras_h5 = "gesture_model.h5"
model.save(keras_h5)

# Export class labels (ordered by index) so the client can load them
labels = [None] * num_classes
for label, idx in train_data.class_indices.items():
    labels[idx] = label
labels_path = os.path.join(save_model_path, "labels.json")
with open(labels_path, "w", encoding="utf-8") as f:
    json.dump(labels, f, ensure_ascii=False, indent=2)

print(f"Saved labels to: {labels_path}")

# Convert to TensorFlow.js format (target directory = save_model_path)
converter_cmd = [
    sys.executable, "-m", "tensorflowjs_converter",
    "--input_format", "keras",
    keras_h5,
    save_model_path
]

print("Running:", " ".join(converter_cmd))
try:
    subprocess.run(converter_cmd, check=True)
    print("✅ Conversion to TFJS complete. Files written to", save_model_path)
except Exception as e:
    print("⚠️ Failed to run tensorflowjs_converter automatically:", e)
    print("You can manually run:")
    print("    tensorflowjs_converter --input_format keras gesture_model.h5 ", save_model_path)

print("✅ Training script finished. Model (H5) and labels.json are available.")
print("Classes:", train_data.class_indices)
