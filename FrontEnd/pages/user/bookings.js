import SingleBooking from "../../components/singlebooking";
import Navbar from "../../components/navbar"
import styles from "../../styles/bookings.module.css"
import { useEffect,useState } from "react";
import axios from "axios";


export default function (){

    const [userid,setUserId]=useState("");
    const [bookedBikes,setBookedBikes]=useState([])

    


    async function fetchBookedBikes(){


        console.log("user id is: "+userid)

        if(userid!="")
       axios.get(`http://localhost:8080/user/bookings/${userid}`).then((data)=>{


        // console.log(data.data)

          if(data.data.data){
         setBookedBikes((pre)=>{

            return [...data.data.data]
        })
    }
            
        }).catch((error)=>{


            console.log(error)



        })
    

    }

    useEffect(()=>{



        if(userid!=localStorage.getItem("user_id"))
        setUserId(localStorage.getItem("user_id"))

        fetchBookedBikes()

    },[userid])
    
    return(

        <>
         <Navbar/>
         <div className={styles.container}>
            {bookedBikes.map((bike)=>(

                 <SingleBooking key={bike._id} bike={bike}/>

                

            ))}
        
       
        </div>
        </>
    )


}