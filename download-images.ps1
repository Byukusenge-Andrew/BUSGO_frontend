$ErrorActionPreference = "Stop"

# Create images directory if it doesn't exist
$imagesDir = "src/assets/images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force
}

# Download hero background image (Rwanda landscape)
$heroImageUrl = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99"
Invoke-WebRequest -Uri $heroImageUrl -OutFile "$imagesDir/hero-bg.jpg"

# Download modern bus image
$busImageUrl = "https://images.unsplash.com/photo-1570125909232-eb263c188f7e"
Invoke-WebRequest -Uri $busImageUrl -OutFile "$imagesDir/transport-truck.jpg"

Write-Host "Images downloaded successfully!"
