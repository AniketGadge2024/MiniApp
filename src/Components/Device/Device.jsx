import React from 'react'
import './Device.css'
import Basicinfo from '../BasicInfo/Basicinfo'
import Processor from '../Processorinfo/Processor'
import Network from '../Network/Network'
const Device = () => {
  return (
    <div>
      <Basicinfo></Basicinfo>
      <Processor></Processor>
      <Network></Network>
    </div>
  )
}

export default Device
