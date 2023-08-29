import React from 'react';
import styles from '../styles/singlebooking.module.css';
import axios from 'axios';

import { useEffect,useState } from 'react';


function SingleBooking({bike}) {


  console.log(bike)


  

  const [owner,setOwner]=useState({})
  const [bikeImages,setBikeImages]=useState(null)
  
  //we have owner id with bike Now fetch Owner details(name,phonenumber and email)

  async function fetchOwnerDetails(){

    await axios.get(`http://localhost:8080/user/basicinfo/${bike.ownerid}`).then((data)=>{

    if(data.status==200)
    {
      setOwner(()=>{
        return {...data.data.data}
      })
    }

    }).catch((err)=>{

      console.log(err)

    })
  }

  useEffect(()=>{

    fetchOwnerDetails()



  },[bike])

  

  const handleImageUpload = (e) => {

    let files=e.target.files

    setBikeImages(()=>{
      return files
    })
    // Handle image upload logic here
  };

  const handleStartRide = () => {
    // Handle start ride logic here
  };


  const handleSendImages =()=>{

    console.log(bikeImages)

    if(bikeImages==null)
    return;

    let formData=new FormData();

    for (let i = 0; i < bikeImages.length; i++) {
      formData.append("bikeImages", bikeImages[i]);
    }

    axios.post(`http://localhost:8080/booking/sendbikeimages/${bike._id}`,formData,{
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((data)=>{
      console.log(data)
    }).catch((e)=>{console.log(e)})
  
  }


  

  return (
    <div className={styles.singleBooking}>
      <div className={styles.bikeDetails}>
        <img src={bike.image} alt="Bike" className={styles.bikeImage} />
        
      </div>
      <div className={styles.ownerDetails}>
        <>
        <h2>{bike.bikeName}</h2>
        <p>Time: {bike.availableOn+"("+bike.availableFrom+"-"+bike.availableTo+")"}</p>
        <p>Price per hour: ${bike.rate}</p>
        <p>Location: {bike.street+"-"+bike.city}</p>
        </>
        <h3>Owner Details:</h3>
        <p>Name: {owner.name}</p>
        <p>Phone Number: {owner.phoneNumber}</p>
        <p>Email: {owner.email}</p>
      </div>
      <div className={styles.imageUpload}>
        <h3>Upload Bike Images from all sides:</h3>
        <input multiple type="file" accept=".jpg, .jpeg, .png" onChange={handleImageUpload} /> 
         
        
        <div>
        
        <button className={styles.startRideButton} onClick={handleSendImages}>
        Send Images
      </button>
      <button className={styles.startRideButton} onClick={handleStartRide}>
        Start
      </button>

      </div>
        
        
      </div>
     
    </div>
  );
}

export default SingleBooking;
