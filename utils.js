  
  
       //convert time to nigeria timezone 
export function convertTZ(date, tzString){
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
  }
  
  //exports.convertTZ
