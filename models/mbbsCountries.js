// models/mbbsCountry.js
import mongoose from 'mongoose';

const EligibilitySchema = new mongoose.Schema({
  ageLimit: { type: String, required: true },
  academicRequirement: { type: String, required: true },
  neetRequirement: { type: String },
  languageRequirement: { type: String }
});

const UniversitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  annualFees: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  intake: { type: String, required: true }
});

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const MbbsCountrySchema = new mongoose.Schema({
  countryName: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String }, 
  discoverDescription: { type: String },
  whyThisCountry:{type:String},  
  highlights: [{ type: String }],
  eligibility: EligibilitySchema,
  tuitionFees: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  costOfLiving: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  scholarship: { 
     type: String,  
  },
  topUniversities: [UniversitySchema],
  aboutUniversity:[ {
    universityName:{
        type: String,
    },
    universityDetail:{
        type: String,
    },
  }],
  journeyPlan:  
    {
      info: {
        type: String,
      },
      description: {
        type: String,
      },
      facilities: {
        type: [String],
      }
    }
   
  ,
 
  faqs: [FaqSchema]
}, { timestamps: true }); 



const MbbsCountry = mongoose.model('mbbs_countries', MbbsCountrySchema); 
export default MbbsCountry
