"use client"
import React, { useState , useEffect } from 'react'
import Map from '@/app/components/Map/map'
const page = () => {



  return (
   <>
   
    <div className='h-screen w-screen flex items-center justify-center bg-slate-900'>
      <Map/>
    </div>
   </>
  )
}

export default page
