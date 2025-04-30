import React from 'react'
import './Device.css'
import Basicinfo from '../BasicInfo/Basicinfo'
import Processor from '../Processorinfo/Processor'
import Network from '../Network/Network'
import Media from '../Media/Media'
const Device = () => {
  return (
    <div>
      <Basicinfo></Basicinfo>
      <Processor></Processor>
      <Network></Network>
    <Media></Media>
    </div>
  )
}

export default Device
