import React from 'react'
import SideBar from './SideBar'
import Navbar from './Navbar'

const Layout = ({children, showSideBar=false}) => {
  return (
    <div className='min-h-screen'>
      <div className='flex'>
        {showSideBar && <SideBar />} 
        {/* show SideBar when true, means when user wants . */}

        <div className='flex-1 flex flex-col'> 
          {/* flex-1 here fills all the remaining space after sideBar */}
           {/* flex and flex-col ensures 'navbar' remains at the top */}
            <Navbar />

            <main className='flex-1 overflow-y-auto'>{children}</main> 
            {/* flex-1 here fill all the remaining vertical space after navbar */}
            {/* overflow-y-auto → adds a vertical scrollbar if the content exceeds the visible height. */}
        
        </div>        
      </div>  
    </div>
  )
}

export default Layout