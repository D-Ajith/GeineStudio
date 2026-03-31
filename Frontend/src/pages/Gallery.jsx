import React from 'react'
import DomeGallery from "../components/DomeGallery";

const Gallery = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' ,backgroundColor: 'white'}}>
      <DomeGallery
  fit={1}
  minRadius={300}
  maxVerticalRotationDeg={5}
  segments={20}
  dragDampening={2}
  grayscale={false}
/>
    </div>
  )
}

export default Gallery
