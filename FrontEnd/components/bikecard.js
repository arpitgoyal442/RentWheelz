import React from 'react';
import styles from '../styles/bikecard.module.css';
import { useRouter } from 'next/router';

function BikeCard({ bike }) {

    const router=useRouter();

    let handleCardClick=()=>{

      if(bike.customerid!=""){

        alert("Already Booked")
        return;

      }

      else{

        router.push({
            pathname: '/bikes/'+bike._id,
            // query:bike
          });
        }
        

    }

  return (
    <div onClick={handleCardClick} className={styles.card}>
      <img src={bike.image} alt={bike.bikeName} className={styles.image} />
      <h2 className={styles.name}>{bike.bikeName}</h2>
      <p className={styles.location}>Location: {bike.address}</p>
      <p className={styles.location}>Available on :{bike.availableOn}({bike.availablefrom}-{bike.availableTo})</p>
      <p className={styles.rate}>Hourly Rate: ${bike.rate}</p>
    </div>
  );
}

export default BikeCard;
