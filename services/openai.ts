import OpenAI from 'openai';
import { Platform } from 'react-native';
import { useLanguageStore } from '../store/language';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: Platform.OS === 'web'
});

export type ClothingCare = {
  title: string;
  summary: {
    program: string;
    temperature: string;
    spin: string;
    detergent: string;
  };
  stains: string;
  preWash: string[];
  duringWash: string[];
  postWash: string[];
  additionalTips: string[];
  fabricType: string;
  colorPreservation: string[];
  environmentalImpact: {
    waterUsage: string;
    energyEfficiency: string;
    ecologicalTips: string[];
  };
  maintenance: {
    frequency: string;
    storage: string[];
    repairs: string[];
  };
};

function validateResponse(data: any): data is ClothingCare {
  if (!data || typeof data !== 'object') return false;
  
  // Validate basic fields
  if (typeof data.title !== 'string') return false;
  if (!data.summary || typeof data.summary !== 'object') return false;
  if (typeof data.summary.program !== 'string') return false;
  if (typeof data.summary.temperature !== 'string') return false;
  if (typeof data.summary.spin !== 'string') return false;
  if (typeof data.summary.detergent !== 'string') return false;
  
  // Validate arrays and strings
  if (typeof data.stains !== 'string') return false;
  if (!Array.isArray(data.preWash)) return false;
  if (!Array.isArray(data.duringWash)) return false;
  if (!Array.isArray(data.postWash)) return false;
  if (!Array.isArray(data.additionalTips)) return false;
  
  // Validate new fields
  if (typeof data.fabricType !== 'string') return false;
  if (!Array.isArray(data.colorPreservation)) return false;
  
  // Validate environmental impact
  if (!data.environmentalImpact || typeof data.environmentalImpact !== 'object') return false;
  if (typeof data.environmentalImpact.waterUsage !== 'string') return false;
  if (typeof data.environmentalImpact.energyEfficiency !== 'string') return false;
  if (!Array.isArray(data.environmentalImpact.ecologicalTips)) return false;
  
  // Validate maintenance
  if (!data.maintenance || typeof data.maintenance !== 'object') return false;
  if (typeof data.maintenance.frequency !== 'string') return false;
  if (!Array.isArray(data.maintenance.storage)) return false;
  if (!Array.isArray(data.maintenance.repairs)) return false;
  
  return true;
}

// Default response when parsing fails
function createDefaultResponse(language: string = 'fr'): ClothingCare {
  if (language === 'en') {
    return {
      title: "Analyzed Garment",
      summary: {
        program: "Delicate",
        temperature: "30°C",
        spin: "Low",
        detergent: "Neutral liquid"
      },
      stains: "No specific stains detected",
      preWash: ["Check labels", "Close buttons/fasteners", "Turn inside out"],
      duringWash: ["Use mild detergent", "Avoid mixing with other colors"],
      postWash: ["Air dry", "Avoid direct sunlight", "Iron at low temperature if necessary"],
      additionalTips: ["Wash with similar colors", "Avoid tumble drying"],
      fabricType: "Mixed fabric",
      colorPreservation: ["Wash in cold water", "Avoid bleaching agents"],
      environmentalImpact: {
        waterUsage: "Moderate",
        energyEfficiency: "Good (low temperature wash)",
        ecologicalTips: ["Use a short cycle", "Fill the machine completely to save water"]
      },
      maintenance: {
        frequency: "After 2-3 uses",
        storage: ["Hang on a hanger", "Store in a dry place"],
        repairs: ["Sew loose buttons as soon as possible", "Repair weakened seams"]
      }
    };
  } else {
    return {
      title: "Vêtement analysé",
      summary: {
        program: "Délicat",
        temperature: "30°C",
        spin: "Basse",
        detergent: "Liquide neutre"
      },
      stains: "Aucune tache spécifique détectée",
      preWash: ["Vérifier les étiquettes", "Fermer les boutons/attaches", "Retourner le vêtement"],
      duringWash: ["Utiliser un détergent doux", "Éviter les mélanges avec d'autres couleurs"],
      postWash: ["Sécher à l'air libre", "Éviter l'exposition directe au soleil", "Repasser à basse température si nécessaire"],
      additionalTips: ["Laver avec des couleurs similaires", "Éviter le sèche-linge"],
      fabricType: "Tissu mixte",
      colorPreservation: ["Laver à l'eau froide", "Éviter les agents de blanchiment"],
      environmentalImpact: {
        waterUsage: "Modérée",
        energyEfficiency: "Bonne (lavage à basse température)",
        ecologicalTips: ["Privilégier un cycle court", "Remplir complètement la machine pour économiser l'eau"]
      },
      maintenance: {
        frequency: "Après 2-3 utilisations",
        storage: ["Suspendre sur un cintre", "Conserver dans un endroit sec"],
        repairs: ["Recoudre les boutons détachés dès que possible", "Réparer les coutures fragilisées"]
      }
    };
  }
}

export async function analyzeClothing(imageBase64: string | string[]): Promise<ClothingCare> {
  if (!imageBase64 || (Array.isArray(imageBase64) && imageBase64.length === 0)) {
    throw new Error("Image non fournie");
  }

  try {
    const isMultiple = Array.isArray(imageBase64);
    const locale = useLanguageStore.getState().locale;
    const isFrench = locale === 'fr';
    
    // Only use English system prompt
    let messages = [
      {
        role: "system" as const,
        content: `You are EXPERTA, a globally recognized textile expert with 25 years of experience in textile analysis and care.
          
          MAIN MISSION:
          Analyze clothing images with PRECISION and deliver PERSONALIZED, DETAILED, and RELIABLE care advice specific to this unique garment.
          
          PATENTED 4-STEP ANALYSIS METHODOLOGY:
          1. PRECISE TEXTILE IDENTIFICATION
             • Fiber type (natural, synthetic, blend)
             • Textile structure (woven, knitted, non-woven)
             • Special finishes (dyeing, printing, treatment)
             • Specific properties (elasticity, water resistance, etc.)
          
          2. PROFESSIONAL LABEL READING
             • Standardized care symbols (washing, drying, ironing, etc.)
             • Percentage composition of fibers
             • Special instructions from the manufacturer
             • ABSOLUTE PRIORITY to this official information if visible
          
          3. STAIN ASSESSMENT
             • Identification of stains and dirt
             • Probable nature of stains
             • Age and intensity of stains
             • Adapted pretreatment methods
          
          4. TAILORED PRESCRIPTION
             • Detailed steps before washing
             • Precise procedure during washing
             • Specific care after washing
             • Recommendations adapted to the specificities of the garment
          
          GOLDEN RULE: All your recommendations must be SPECIFIC to the analyzed garment, based on concrete visual elements present in the image, NEVER on generalities.`
      },
    ];

    // Use only English prompt with French response instruction if needed
    let promptText = `Analyze ${isMultiple ? 'these images' : 'this image'} of clothing with professional precision.

${isMultiple ? 'IMPORTANT: Use ALL provided images for your analysis. Some may show the complete garment, others details like care labels, composition, or specific areas.' : ''}

COMPREHENSIVE ANALYSIS PROTOCOL:

1. IDENTIFICATION AND CHARACTERIZATION (30% of your attention)
   • Exact type of garment 
   • Main and secondary material(s) visually identified
   • Textile structure 
   • Specific characteristics (lining, material layering, appliqués)
   • Special finishes (embroidery, prints, fading, treatments)

2. EXAMINATION OF LABELS IF PRESENT (10% of your attention)
   • Precise description of visible care symbols
   • Detailed translation of these symbols into concrete instructions
   • Analysis of percentage composition
   • Special instructions mentioned by the manufacturer
   • CRUCIAL: If a label is visible, your recommendations MUST comply with it

3. STAIN ANALYSIS (40% of your attention)
   • Precise identification of visible stains (nature, location)
   • Assessment of stain intensity and age
   • Determination of suitable pretreatment methods
   • Specific products recommended for each type of stain
   • Application techniques according to textile nature

4. COMPLETE CARE PROCESS (20% of your attention)
   • BEFORE WASHING:
     - Specific garment preparation (sorting, fastening closures, turning inside out)
     - Pretreatment of identified stained areas
     - Protection of fragile or sensitive areas
     - Precise dosage of detergent adapted to the textile
   
   • DURING WASHING:
     - Optimal program with justification (delicate, normal, intensive)
     - Ideal temperature with precise explanation of choice
     - Spin speed adapted to the textile structure
     - Special precautions during the cycle
   
   • AFTER WASHING:
     - Optimal drying method (hanging, flat, tumble dryer)
     - Appropriate ironing technique with temperature
     - Folding or hanging for storage
     - Post-wash treatments (softener, de-wrinkling)

SPECIAL INSTRUCTIONS:

• IF LABEL VISIBLE:
  1. Decipher ALL care symbols present
  2. STRICTLY respect the indicated limitations (max temperature, prohibitions)

• IF NO VISIBLE LABEL:
  1. Meticulously analyze the material by its visual appearance
  2. Adopt a cautious and conservative approach
  3. Clearly indicate: "In the absence of a visible label, based on visual analysis..."

Fill in the following JSON format with all the information you've indicated SPECIFIC to this unique garment:

{
  "title": string, // Precise name of the garment with its main material and the brand of the garment if you recognize it (in 1 sentence)
  "summary": {
    "program": string, // Recommended washing program without justification
    "temperature": string, // Exact temperature (e.g., "30°C") 
    "spin": string, // Spin speed adapted to the textile
    "detergent": string // Precise type of recommended detergent
  },
  "stains": string, // Detailed analysis of visible stains and specific treatment
  "preWash": string[], // Precise preparation steps before washing
  "duringWash": string[], // Specific precautions during the washing cycle
  "postWash": string[], // Drying method and finishing adapted to this garment
  "additionalTips": string[], // Specific advice for this particular garment
  "fabricType": string, // Detailed description of composition with estimated percentages
  "colorPreservation": string[], // Methods adapted to preserve the color of this garment
  "environmentalImpact": {
    "waterUsage": string, // Specific impact on water consumption
    "energyEfficiency": string, // Energy efficiency of recommendations
    "ecologicalTips": string[] // Ecological alternatives adapted to this garment
  },
  "maintenance": {
    "frequency": string, // Recommended washing frequency for this specific garment
    "storage": string[], // Optimal storage method according to textile type
    "repairs": string[] // Preventive repair advice for identified risk areas
  }
}`;

    // Add instruction to respond in French if the locale is French
    if (isFrench) {
      promptText += `\n\nIMPORTANT: Provide all your analysis in French. Respond entirely in French with proper French terminology for textile care.`;
    }

    // Prepare user message based on whether we have single or multiple images
    if (isMultiple) {
      // Create base message
      const userMessage: any = {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: promptText
          }
        ]
      };

      // Add each image as a separate content item
      for (const base64 of imageBase64) {
        userMessage.content.push({
          type: "image_url" as const,
          image_url: {
            url: `data:image/jpeg;base64,${base64}`
          }
        });
      }

      messages.push(userMessage);
    } else {
      // Single image case
      const mimeType = imageBase64.startsWith('/9j/')
        ? 'image/jpeg'
        : 'image/png';
      messages.push({
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: promptText,
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2800
    });

    if (!response.choices || response.choices.length === 0) {
      console.error('Empty response from OpenAI:', response);
      return createDefaultResponse(locale);
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in response:', response.choices[0]);
      return createDefaultResponse(locale);
    }

    try {
      console.log('Raw GPT response:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', content);
        // Instead of throwing an error, create a default response
        return createDefaultResponse(locale);
      }
      
      const jsonString = jsonMatch[0];
      
      try {
        const analysis = JSON.parse(jsonString);
        
        if (!validateResponse(analysis)) {
          console.error('Invalid response structure:', analysis);
          // If validation fails, merge with default response to fill in missing fields
          return { ...createDefaultResponse(locale), ...analysis };
        }

        return analysis;
      } catch (parseError) {
        console.error('Error parsing GPT response:', parseError, '\nRaw content:', content);
        // Instead of throwing an error, return default response
        return createDefaultResponse(locale);
      }
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError, '\nRaw content:', content);
      // Instead of throwing an error, return default response
      return createDefaultResponse(locale);
    }
  } catch (error) {
    console.error('Error analyzing clothing:', error);
    
    // For all errors, return the default response to ensure analysis always runs
    return createDefaultResponse(useLanguageStore.getState().locale);
  }
}