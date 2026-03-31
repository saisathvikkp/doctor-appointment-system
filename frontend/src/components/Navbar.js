import React from "react";

function Navbar(){

return(

<div style={{
display:"flex",
justifyContent:"space-between",
padding:"15px 40px",
background:"#1f77d0",
color:"white"
}}>

<h2>CityCare Hospital</h2>

<div>

<a href="/doctors" style={{color:"white",marginRight:"20px"}}>Doctors</a>

<a href="/login" style={{color:"white",marginRight:"20px"}}>Login</a>

<a href="/register" style={{color:"white"}}>Register</a>
<a href="/dashboard" style={{color:"white",marginRight:"20px"}}>
Dashboard
</a>
</div>

</div>

);

}

export default Navbar;