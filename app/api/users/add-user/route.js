// import { connectToDB } from '@/utils/database';
// import User from '@/models/user';
// import nodemailer from 'nodemailer';
// import axios from 'axios';
// export async function POST(request) {
//   await connectToDB();
//   try {
//     const data = await request.json();
//     const newUser = await User.create(data);

//     console.log(newUser);
//     // Send email to yourself
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: process.env.MY_EMAIL,
//       subject: 'New Contact Created',
//       text: `A new contact has been created with the following details:\n\nName: ${newUser.name}\nPhone: ${newUser.phone}\nEmail: ${newUser.email}\nBudget: ${newUser.budget}\nReady: ${newUser.ready}\nHow: ${newUser.how}`,
//     };

//     await transporter.sendMail(mailOptions);
//     try {
//       const fireberryResponse = await axios.post(
//           'https://api.powerlink.co.il/api/record/1',
//           {
//               Accountname: newUser.name,
//               Telephone1: newUser.phone,
//               Emailaddress1: newUser.email,
//               Originatingleadcode: 11,
//               billingcountry: newUser.country,
//               description: `How do you know about us?:${newUser.how}, Are you ready ?:${newUser.ready}, what is your Budget:${newUser.budget}, where from? ${newUser.country} `
//           },
//           {
//               headers: {
//                 // new
//                   Tokenid: process.env.NEXT_PUBLIC_FIREBERRY_TOKEN_ID,
//                   'Content-Type': 'application/json'
//               }
//           }
//       );
    
//   } catch (error) {
//       console.error('Error submitting form data:', error.response ? error.response.data : error.message);
//   }
//     return new Response(JSON.stringify(newUser), { status: 201 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), { status: 400 });
//   }
// }

import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export async function POST(request) {
  await connectToDB();

  try {
    const userData = await request.json();
    if (!userData.clerkId || !userData.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const newUser = await User.create(userData);

    return new Response(
      JSON.stringify({ message: 'User created successfully', user: newUser }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

