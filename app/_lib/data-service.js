import { notFound } from "next/navigation";
// import { eachDayOfInterval } from "date-fns";
import { supabase } from "./supabase";

// import { createClient } from '@/app/_lib/client'

// const supabase = createClient()
/////////////
// GET


export async function getPacientById(id) {
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}


export const createPacient = async function (newPacient) {
  const { data, error } = await supabase
    .from('pacientes')
    .insert([newPacient]) // Passa o objeto do paciente a ser inserido
    .select(); // Retorna os dados inseridos
    
    // console.log(newPacient)
  if (error) {
    console.error("Error creating pacient:", error);
    throw new Error("Paciente could not be created");
  }

  return data; // Retorna os dados inseridos
}

export const getPacients = async function (idUser) {
  const { data, error } = await supabase
    .from("pacientes")
    .select("id, created_at, nomePaciente, status, dataNascimento, email, telefone, imagem, usuarioId")
    .eq("usuarioId", idUser)
    .order("created_at", { ascending: false });

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    throw new Error("Pacients could not be loaded");
  }

  return data;
};

// usuarios are uniquely identified by their email address
export async function getProfile(email) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no usuario in the sign in callback
  return data;
}

// export async function updateProfile(id, updatedFields) {
//   const { data, error } = await supabase
//   .from("usuarios")
//   .update(updatedFields)
//   .eq("id", id)
//   .select()
//   .single();
  
//   if (error) {
//     console.error(error);
//     throw new Error("usuario could not be updated");
//   }
//   return data;
// }

export async function createUser(newUser) {
  console.log(newUser)
  const { data, error } = await supabase.from("usuarios").insert([newUser]);

  if (error) {
    console.error(error);
    throw new Error("User could not be created");
  }

  return data;
}
// export async function getBookings(usuarioId) {
//   const { data, error, count } = await supabase
//     .from("bookings")
//     // We actually also need data on the Pacients as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
//     .select(
//       "id, created_at, startDate, endDate, numNights, numusuarios, totalPrice, usuarioId, PacientId, Pacients(name, image)"
//     )
//     .eq("usuarioId", usuarioId)
//     .order("startDate");

//   if (error) {
//     console.error(error);
//     throw new Error("Bookings could not get loaded");
//   }

//   return data;
// }

// export async function getBookedDatesByPacientId(PacientId) {
//   let today = new Date();
//   today.setUTCHours(0, 0, 0, 0);
//   today = today.toISOString();

//   // Getting all bookings
//   const { data, error } = await supabase
//     .from("bookings")
//     .select("*")
//     .eq("PacientId", PacientId)
//     .or(`startDate.gte.${today},status.eq.checked-in`);

//   if (error) {
//     console.error(error);
//     throw new Error("Bookings could not get loaded");
//   }

//   // Converting to actual dates to be displayed in the date picker
//   const bookedDates = data
//     .map((booking) => {
//       return eachDayOfInterval({
//         start: new Date(booking.startDate),
//         end: new Date(booking.endDate),
//       });
//     })
//     .flat();

//   return bookedDates;
// }

// export async function getSettings() {
//   const { data, error } = await supabase.from("settings").select("*").single();

//   // await new Promise((res) => setTimeout(res, 5000));

//   if (error) {
//     console.error(error);
//     throw new Error("Settings could not be loaded");
//   }

//   return data;
// }

// export async function getCountries() {
//   try {
//     const res = await fetch(
//       "https://restcountries.com/v2/all?fields=name,flag"
//     );
//     const countries = await res.json();
//     return countries;
//   } catch {
//     throw new Error("Could not fetch countries");
//   }
// }

/////////////
// CREATE

/*
export async function createBooking(newBooking) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  return data;
}
*/
/////////////
// UPDATE

/*
// The updatedFields is an object which should ONLY contain the updated data
export async function updateusuario(id, updatedFields) {
  const { data, error } = await supabase
    .from("usuarios")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("usuario could not be updated");
  }
  return data;
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
*/