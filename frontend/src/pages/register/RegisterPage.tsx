import { VscAccount } from "react-icons/vsc";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { IoPhonePortraitSharp } from "react-icons/io5";
import { RiCake2Line } from "react-icons/ri";
import { FaTransgenderAlt } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { MdLock } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { ZodDate, date, z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8, {message: 'Password must be at least 8 characters'}),
  confirmPassword: z.string().trim().min(8, {message: 'Password must be at least 8 characters'}),
  firstName: z.string().default("MyName"),
  lastName: z.string().default("MyLast"),
  displayName: z.string().trim().min(1, {message: 'Fill display name'}),
  phoneNumber: z.string().default("0123456789"),
  birthDate: z.coerce.date().default(() => new Date('2002-04-15')),
  gender: z.enum(["Male", "Female", "Other"]).default("Male"),
  role: z.enum(["Customer", "Provider"]).default("Customer")
})
.refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Password and confirm password does not match'
})

type ValidationSchemaType = z.infer<typeof schema>;

export default function RegisterPage() {

  const [isEmailDuplicate, setEmailDuplicate] = useState<boolean>(false)
  const [enableButton, setEnableButton] = useState<boolean>(true)


  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ValidationSchemaType>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<ValidationSchemaType> = async (data) => {
    setEnableButton(false)
    setEmailDuplicate(false)
    console.log(data)
    try {
      const result = await fetch(process.env.REACT_APP_BACKEND_URL + "/auth/register",{
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body : JSON.stringify(data),
        credentials : 'include',
      });
      if (result.ok){
        const res = await result.json();
        console.log(res.token);
        
        document.location.href = "/"
      }
      if (result.status === 400) {
        // User already existed
        setEnableButton(true)
        setEmailDuplicate(true)
      }
    }
    catch (err) {
      setEnableButton(true)
    }
    
    
    
  }

  useEffect(() => {
    document.title = 'Registration | HorHub'
  }, [])
  
  return(
    <div className="page">
      <div className="text-2xl font-bold">Register</div>
      <div className="rounded-xl border border-emerald-500 mt-8 h-fit bg-white w-full md:w-4/5 lg:w-3/5 pb-8 text-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="mx-10 mt-8 flex flex-col items-center gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-6 gap-y-10 mt-10">


            <div className="relative flex flex-row">
              <IoIosMail className='h-6 w-6 place-self-center text-emerald-500' />
              <input 
              type="text"
              placeholder="Email address" 
              className={`ml-2 border-0 border-b outline-0 w-full ${errors.email ? "border-red-700" : "border-black"}`}
              {...register('email')} />
              {
                errors.email && <div className="absolute pl-8 -bottom-1 translate-y-full text-red-700">{errors.email.message}</div>
              }
              
            </div>

            <div className="relative flex flex-row">
              <VscAccount className='h-6 w-6 place-self-center text-emerald-500'/>
              <input 
              type="text"
              placeholder="Display Name" 
              className={`ml-2 border-0 border-b outline-0 w-full ${errors.displayName ? "border-red-700" : "border-black"}`}
              {...register('displayName')} />
              {
                errors.displayName && <div className="absolute pl-8 -bottom-1 translate-y-full text-red-700">{errors.displayName.message}</div>
              }
            </div>
            

            <div className="relative flex flex-row">
              <MdLock className='h-6 w-6 place-self-center text-emerald-500' />
              <input 
              type="password"
              placeholder="Password" 
              className={`ml-2 border-0 border-b outline-0 w-full ${errors.password ? "border-red-700" : "border-black"}`}
              {...register('password')} />
              {
                errors.password && <div className="absolute pl-8 -bottom-1 translate-y-full text-red-700">{errors.password.message}</div>
              }
            </div>

            <div className="relative flex flex-row">
              <MdLock className='h-6 w-6 place-self-center text-emerald-500' />
              <input 
              type="password"
              placeholder="Confirm Password" 
              className={`ml-2 border-0 border-b outline-0 w-full ${errors.confirmPassword ? "border-red-700" : "border-black"}`}
              {...register('confirmPassword')} />
              {
                errors.confirmPassword && <div className="absolute pl-8 -bottom-1 translate-y-full text-red-700">{errors.confirmPassword.message}</div>
              }
            </div>
            
          </div>
          {
            enableButton ? <button type="submit" className="primary-button">Register</button> : <button type="submit" className="disabled-button" disabled>Register</button>
          }
        </form>
      </div>
    </div>
  )
}