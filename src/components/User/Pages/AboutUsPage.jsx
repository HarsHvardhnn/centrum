import React from 'react'
import Doctors from '../Doctors'
import News from '../News'
import ContactSection from '../ContactSection'
import TestimonialSlider from '../TestimonialSlider'
import PageHeader from '../PageHeader'
import HospitalCareSection from '../HospitalCareSection'

const AboutUsPage = () => {
  return (
    <>
    <PageHeader title="About Us" path="Home / About Us" bgurl="/images/about-header.jpg"/>
    <HospitalCareSection/>
    <TestimonialSlider/>
    <Doctors/>
    <News/>
    <ContactSection/>
    </>
  )
}

export default AboutUsPage