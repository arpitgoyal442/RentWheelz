import React, { useEffect, useState } from "react";
import styles from "../../styles/listbike.module.css";
import Navbar from "../../components/navbar";
import axios from "axios";

const ListBike = () => {


  function objectToFormData(obj) {
    const formData = new FormData();

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        formData.append(key, obj[key]);
      }
    }

    return formData;
  }

  const [bikeData, setBikeData] = useState({
    OwnerId: "",
    BikeName: "",
    BikeNumber: "",
    Rate: "",
    AvailableOn: "",
    Image: null,
    Street: "",
    AvailableFrom: "",
    AvailableTo: "",
    City: "",
    IsOccupied:false,

    Latitude: "",
    Longitude: "",

    Description: "",
    Address: "",
  });

  let handleValueChange = (e) => {
    const { name, value } = e.target;

    setBikeData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };

  let handleImageUpload = (e) => {
    let img = e.target.files[0];

    console.log("image is");
    console.log(img);

    setBikeData((pre) => ({
      ...pre,
      Image: img,
    }));
  };

  let submitButton = async (e) => {
    e.preventDefault();
    bikeData.OwnerId = localStorage.getItem("user_id");

    // Check if Important Fields are not empty
    if (
      bikeData.BikeName == "" ||
      bikeData.BikeNumber == "" ||
      bikeData.Street == "" ||
      bikeData.City == "" ||
      bikeData.AvailableOn == "" ||
      bikeData.AvailableFrom == "" ||
      bikeData.AvailableTo == ""
    ) {
      alert("Fill the required fields");
      return;
    }

    // TODO: Check if Date is Ok and from and To time is Ok

    // Find The Cordinates for location

    let address = bikeData.Street + "," + bikeData.City;
    bikeData.Address = address;

    // Open Cage api needs  uriencodedaddress
    let uriEncodedAddress = encodeURIComponent(address);

    let openCageApi = process.env.NEXT_PUBLIC_OPENCAGE_API;
    console.log(openCageApi);

    let opencageURL = `https://api.opencagedata.com/geocode/v1/json?q=${uriEncodedAddress}&key=${openCageApi}`;

    // Calling Api to get Coordinates
    await axios
      .get(opencageURL)
      .then((data) => {
        console.log(data.data.results);

        if (!data.data.results[0]) {
          console.log("Couldn't find latitude and longitude");
          alert("Enter a Valid Location in India and list again");
          return;
        } else {
          var cord = data.data.results[0].bounds.northeast;

          // console.log(typeof(cord.lat))
          bikeData.Latitude = cord.lat ;
          bikeData.Longitude = cord.lng ;
        }
      })
      .catch((e) => {
        console.log(e);
      });


      // Making Form Data From Bikedata object
      let formdata = objectToFormData(bikeData);

      // Making Post Request to add Bike
      await axios
        .post("http://localhost:8080/bike", formdata, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    
    console.log(bikeData);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>List Your Bike </h1>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Bike Name<sup>*</sup>
              </label>
              <input
                required={true}
                onChange={handleValueChange}
                name="BikeName"
                value={bikeData.BikeName}
                type="text"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Bike Number<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                name="BikeNumber"
                value={bikeData.BikeNumber}
                type="text"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Amount per Hour<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                name="Rate"
                placeholder="100/-"
                value={bikeData.Rate}
                type="text"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Area/Street<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                placeholder="chandni Chowk..."
                name="Street"
                value={bikeData.Street}
                type="text"
                className={styles.inputField}
              />
            </div>

            {/*  */}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                City<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                placeholder="Delhi..."
                name="City"
                value={bikeData.City}
                type="text"
                className={styles.inputField}
              />
            </div>

            {/*  */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Available On<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                name="AvailableOn"
                value={bikeData.AvailableOn}
                type="date"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Available from:<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                name="AvailableFrom"
                value={bikeData.AvailableFrom}
                type="time"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Available to:<sup>*</sup>
              </label>
              <input
                onChange={handleValueChange}
                name="AvailableTo"
                value={bikeData.AvailableTo}
                type="time"
                className={styles.inputField}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Image(optional)</label>
              <input
                onChange={handleImageUpload}
                accept=".jpg, .jpeg, .png"
                name="Image"
                type="file"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description(optional)</label>
              <textarea
                name="Description"
                value={bikeData.Description}
                onChange={handleValueChange}
                className={styles.textareaField}
              />
            </div>

            <button
              type="submit"
              onClick={submitButton}
              className={styles.submitButton}
            >
              List Bike
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ListBike;
