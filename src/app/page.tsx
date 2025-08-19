"use client"
import React, { useState , useEffect } from 'react'
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/app/components/Map/map"), {
  ssr: false,
});
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
