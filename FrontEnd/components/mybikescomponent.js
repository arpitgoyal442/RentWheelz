import React from 'react';
import {useState} from 'react'
import styles from '../styles/mybikescomponent.module.css';

const BikeComponent = ({ name, number, hourlyRate, availableTime, status, images }) => {

    const [isZoom,setIsZoom]=useState(true)
  return (
    <div className={styles.container}>

        <div className={styles.bikeInfo}>
      <img className={styles.bikeImage} src={images[0]} alt="Bike" />
      <p>Name: {name}</p>
      <p>Number: {number}</p>
      <p>Hourly Rate: {hourlyRate}</p>
      <p>Available Between: {availableTime}</p>
      <p>Status: {status}</p>
      </div>

      <div className={styles.bikeGallery}>
        { !isZoom&&images.map((image, index) => (
          <img
            key={index}
            className={styles.bikeThumbnail}
            src={image}
            alt={`Bike Image ${index}`}
          />
        ))}

        {isZoom&& <div className={styles.zoomDiv}>

            <p onClick={()=>{setIsZoom(false)}}>close</p>

            <img src="/images/bike1.jpg" alt="" />
            
            </div>}


      </div>
    </div>
  );
};

export default BikeComponent;
