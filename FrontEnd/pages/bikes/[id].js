import React, { useEffect, useState } from "react";
import styles from "../../styles/bikedetails.module.css";
import axios from "axios";

import Navbar from "../../components/navbar";

const BikeDetailsPage = ({ bikeData }) => {
  const [user, setUser] = useState({});
  const [isDocumentComplete, setIsDocumentComplete] = useState(false);

  async function fetchUserDetails() {
    let user_id = localStorage.getItem("user_id");

    await axios
      .get(`http://localhost:8080/user/${user_id}`)
      .then((data) => {
        let user = data.data.data;

        console.log(data.data.data);

        setUser((pre) => {
          return user;
        });

        
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);


  useEffect(()=>{

    if (  
      user.aadharcard != "" &&
      user.email != "" &&
      user.license != "" &&
      user.phone != ""
    ) {
      setIsDocumentComplete(true);
      console.log(isDocumentComplete);
    }else{
      setIsDocumentComplete(false)
    }

  },[user])

  const {
    bikeName,
    image,
    rate,
    address,
    availableOn,
    availableFrom,
    availableTo,
  } = bikeData;


  async function handleBookClick(){

    if (!isDocumentComplete)
    {
      alert("Complete Your Profile and upload required documents to Book")
      return;
    }

    else{

      let bike_id=bikeData._id
      let user_id=localStorage.getItem("user_id")
    
      // Bike will be booked and a mail will be sent to the owner
      await axios.post(`http://localhost:8080/bike/book/${bike_id}`,{
        userid:user_id,
        aadharcard:user.aadharcard,
        license:user.license,
        name:user.name,
        phone:user.phone
      }).then((data)=>{
      console.log(data)
      }).catch((err)=>{
        console.log(err)
      }) 
    }

  }

  

  return (
    <div className={styles.mainContainer}>
      <Navbar />
      <div className={styles.req_indicator} style={{backgroundColor: isDocumentComplete?"white":"rgb(253, 186, 164)" }}>
        <h2>Your Documentation :</h2>

        <div className={styles.documents} >
          <p className={ user.aadharcard!=""?styles.document_ok:styles.document_no}>Adhar Card</p>
          <p className={ user.phone!=""?styles.document_ok:styles.document_no}>Ph no.</p>
          <p className={user.license!=""? styles.document_ok:styles.document_no}>License</p>
          <p className={user.email!=""? styles.document_ok:styles.document_no}>Email</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.bikeDetails}>
          <img src={image} alt={bikeName} className={styles.image} />
          <div className={styles.bikeDetails_info}>
            <h1>{bikeName}</h1>

            <p className={styles.available}>
              <span>Address:</span> {address}
            </p>

            <p className={styles.available}>
              <span>Available from:</span> {availableOn}({availableFrom}-
              {availableTo})
            </p>
            <p className={styles.rate}>
              <span>Hourly Rate: </span> {rate}
            </p>
          </div>
        </div>
      </div>
      <button  onClick={handleBookClick} className={styles.button} >Book</button>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { id } = params;

  let bikeData = {};

  await axios
    .get(`http://localhost:8080/bike/${id}`)
    .then((data) => {
      console.log(data.data.bikeData);

      bikeData = { ...data.data.bikeData };
    })
    .catch((err) => {
      console.log(err);
    });

  return {
    props: {
      bikeData,
    },
  };
}

export default BikeDetailsPage;
