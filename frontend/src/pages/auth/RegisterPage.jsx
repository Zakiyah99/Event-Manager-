import React from 'react'
import { CalendarDays } from 'lucide-react'
import RegisterForm from '../../components/auth/RegisterForm'

const RegisterPage = () => {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-slate-50'>
            <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' />
            <div className='z-10 w-full max-w-md px-4'>
                <div className='mb-8 text-center text-white'>
                    <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10'>
                        <CalendarDays className='h-6 w-6' />
                    </div>
                    <h1 className='text-3xl font-bold'>Event Manager</h1>
                    <p className='mt-2 text-slate-300'>Create an account to start planning events</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    )
}

export default RegisterPage
