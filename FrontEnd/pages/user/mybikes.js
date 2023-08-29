import MyBikeComponent from "../../components/mybikescomponent"
export default function mybikes(){

    const bikeInfo = {
        name: "Mountain Bike",
        number: "12345",
        hourlyRate: "$10",
        availableTime: "9 AM - 6 PM",
        status: "Available",
        images: [
          "/images/bike1.jpg",
          "/images/bike2.jpg",
          "/images/bike3.jpg",
          "/images/bike4.jpg",
          "/images/bike5.jpg",
         
        ]
      };
    
      return (
        <div>
          
          
          <MyBikeComponent {...bikeInfo} />
        </div>
      )
}