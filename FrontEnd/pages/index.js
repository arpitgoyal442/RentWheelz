import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from "next/link"
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
function Home() {

  const router=useRouter()

  const [isSignin,setSignIn]=useState(true)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  


  let handleButtonClick=()=>{

    if(!emailRegex.test(email)){

      alert("Enter a valid email")
      return;
    }

    else if(!strongPasswordRegex.test(password)){
      alert("Enter a strong Password:\n#lowercase\n#uppercase \n#Special character \n#Numeric digit")
      return;
    }


    if(isSignin){

      axios.post("http://localhost:8000/user/signin",{email:email,password:password}).
      then((data)=>{
        console.log(data)
        if(data.status==200){
          localStorage.setItem("jwt_token",data.data.token)
          localStorage.setItem("user_id",data.data.id)
        router.push("/bikes")
        }
        
      })
      .catch((e)=>{console.log(e)})
    }

    else{

      axios.post("http://localhost:8000/user/signup",{email:email,password:password}).
      then((data)=>{
        console.log(data.data)

        // insert this user in 2nd database(app database)
        // TODO: How will you handle if user is inserted in 1st DB and you get error from 2nd DB
        // option1: Rollback

        if(data.status==200)
         axios.post("http://localhost:8080/user",{id:data.data,email:email}).then(()=>{console.log("inserted in app db :",data)})
         .catch((err)=>{console.log(err)})
      
      
      })
      .catch((e)=>{console.log(e)})


    }




    

  }

  return (
    <div className={styles.container}>
      <Head>
        <title>RentWheelz - Bike/Scooty Rental App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        
      
        <Image
        src="/images/logo.png"
        height={344}
        width={344}
        
        />

        
        <div>
        <h1 className={styles.title}>Welcome to RentWheelz</h1>

        <p className={styles.description}>
          Rent a bike or scooty hassle-free for your daily commute or travel needs.
        </p>
        </div>

        <div className={styles.toggle}>
        <h2 onClick={()=>{setSignIn(true)}} className={isSignin?styles.primarytoggle:""}>Sign In</h2>
        <h2 onClick={()=>{setSignIn(false)}} className={!isSignin?styles.primarytoggle:""} >Sign Up</h2>
        </div>

       

        <div className={styles.form}>
          <input type="text" placeholder='Email...' value={email} onChange={(e)=>{setEmail(e.target.value)}} />
          <input  type="password" placeholder='Password...'   value={password} onChange={(e)=>{setPassword(e.target.value)}} />
        </div>

        

       
        <button onClick={handleButtonClick}  className={styles.primaryButton}> {isSignin?"Sign In":"SignUp"}</button>
        
        
      </main>

      <footer className={styles.footer}>
        <p>© 2023 RentWheelz. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;



