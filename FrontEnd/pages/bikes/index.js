import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import BikeCard from '../../components/bikecard.js';
import styles from '../../styles/bikes.module.css';
import Navbar from '../../components/navbar.js';
import Link from 'next/link.js';
import axios from 'axios';
import Statusbar from '../../components/statusbar.js';

 function Bikes({allBikes}) {
    // Dummy bike data

    console.log(allBikes)
    const [locationOn,setLocationOn]=useState(false)
    const [locationImage,setLocationImage]=useState("/images/location.png")
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [userid,setUserId]=useState("")


    useEffect(()=>{

      setUserId(localStorage.getItem("user_id"))

    },[])  


    console.log(userid)

    let handleNearMeClicked=()=>{

      if(locationOn){
        return;
      }else{
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLatitude(latitude);
              setLongitude(longitude);
              setLocationImage("/images/location-enable.png")
              console.log("Latitude and Longitude are "+latitude+" "+longitude)

              // Fetch all the bikes in order they are closer to user

            },
            (error) => {
              console.error('Error getting user location:', error.message);
            }
          );
        } else {
          console.error('Geolocation is not supported by this browser.');
        }
      }
    }
    const bikes=allBikes
    
    const locations = ["Delhi", "Bangalore", "Pune", "Noida","Gurugram","Chennai"];
  
    return (
      <>
      <Navbar/>
      <div className={styles.container}>
        <Head>
          <title>RentWheelz - Browse Bikes</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

       
       {/* <Statusbar/> */}
  
        
        <main className={styles.main}>
        
           
          <h1 className={styles.title}>Browse Bikes</h1>
         
          <div className={styles.filter}>

           
            
            <div className={styles.selectdiv}>
        <label  className={styles.title}>Location:</label>
        <select className={styles.select}>
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        </div>

         <div onClick={handleNearMeClicked}  className={styles.nearme}>
          <img src={locationImage}/>
          <p>Near Me</p>
         </div>
         
      </div>

          {/*  */}
  
          <div className={styles.bikeList}>
            { bikes && bikes.map((bike) => (

                
              bike.ownerid!=userid && <BikeCard key={bike.id} bike={bike} />
            
            ))}
          </div>
        </main>
      </div>
      </>
    );
  }

 
  export  async function getStaticProps(){

    let allBikes=[]

    await axios.get("http://localhost:8080/bike").then((data)=>{

    console.log(data.data.bikes)

    allBikes=data.data.bikes

    }).catch((err)=>{

      console.log("Couldn't get all bikes because :",err)

    })

    return{
      props:{
        allBikes
      }
    }

    

  } 

  export default Bikes
  
