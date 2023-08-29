import Image from 'next/image';
import { useState } from 'react';
import styles from '../../styles/userprofile.module.css';
import Navbar from "../../components/navbar.js"
import axios from 'axios';



export default function UserProfilePage({data}){
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: data.name,
    email: data.email,
    phone: data.phone,
    license: data.license,
    aadharcard: data.aadharcard,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };

  const handleAadharCardUpload = (e) => {
    const file = e.target.files[0];

    setUserData((prevUserData) => ({
            ...prevUserData,
            aadharcard: file,
          }));

    
    
  };

  const handleLicenseUpload=(e)=>{

    const file = e.target.files[0];

    setUserData((prevUserData) => ({
            ...prevUserData,
            license: file,
          }));

  }

  const toggleEditMode = () => {

    if(editMode){

      let formdata=new FormData()
      formdata.append("aadharcard",userData.aadharcard)
      formdata.append("license",userData.license)
      formdata.append("name",userData.name)
       formdata.append("email",userData.email)
       formdata.append("phone",userData.phone)

       let userid=localStorage.getItem("user_id")
      
      
      axios.put("http://localhost:8080/user/"+userid,formdata).then((data)=>{
        console.log(data)
      }).catch((e)=>{console.log(e)})
    }

    setEditMode((prevEditMode) => !prevEditMode);

  
  };

  return (
    <>
    <Navbar/>
    <div className={styles.container}>
    

      <h1>User Profile</h1>
      <div className={styles['profile-image']}>
        <img
          src="/images/user-img.jpg"
          alt="Profile Image"
          
        />
       
      </div>
      
      <div className={styles['profile-details']}>
        <label htmlFor="name">Name:</label>
        {editMode ? (
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
          />
        ) : (
          <p>{userData.name}</p>
        )}

       

        <label htmlFor="email">Email:</label>
        {editMode ? (
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
          />
        ) : (
          <p>{userData.email}</p>
        )}

        <label htmlFor="phone">Phone Number:</label>
        {editMode ? (
          <input
            type="tel"
            id="phone"
            name="phone"
            value={userData.phone}
            onChange={handleInputChange}
          />
        ) : (
          <p>{userData.phone}</p>
        )}

        <label htmlFor="drivingLicense">Driving License:</label>
        {editMode ? (
          <input
            type="file"
            id="drivingLicense"
            name="drivingLicense"
            accept=".jpg, .jpeg, .png"
            onChange={handleLicenseUpload}
          />
        ) : (
      
          <p>{userData.license ? 'License uploaded' : 'No License'}</p>
         
        
        )}

        <label htmlFor="aadharCard">Aadhar Card:</label>
        {editMode ? (
          <>
            <input
              type="file"
              id="aadharCard"
              name="aadharCard"
              
              accept=".jpg, .jpeg, .png"
              onChange={handleAadharCardUpload}
            />
            {/* {userData.aadharcard && (
              <img
                src={userData.aadharcard}
                alt="Aadhar Card Preview"
                width={200}
                height={200}
              />
            )}
             {userData.license && (
              <img
                src={userData.license}
                alt="License"
                width={200}
                height={200}
              />
            )} */}
          </>
        ) : (
          
          <p>{userData.aadharcard ? 'Aadhar Card uploaded' : 'No Aadhar Card'}</p>
          
        )}
      </div>

      < div className={styles.docimg}>
      <img
              src={userData.aadharcard}
              alt="Aadhar Card Preview"
              width={150}
              height={150}
              
              
              
            />
            <img
              src={userData.license}
              alt="Aadhar Card Preview"
              width={150}
              height={150}
              
              
            />
      </div>


      <div className={styles['edit-button']}>
        <button onClick={toggleEditMode}>
          {editMode ? 'Save' : 'Edit'}
        </button>
      </div>

      
    </div>
    </>
  );
};

export async function getServerSideProps(context) {
  // Fetch data from an API or any data source

  
  let userid=context.query.id;

  let data={
    name:""
  };


  await axios.get("http://localhost:8080/user/"+userid)
  .then(
    (d)=>{
      console.log(d.data.data)
      data=d.data.data
      
    
    }
    )
  .catch((e)=>{
    console.log(e)
    
    
  })


  return {
    props: {
      data,
    },
  };
  

  
}

