import pyarabic.araby as araby
import sys
import re

#added UTF-8 (the universal text standard that supports Arabic)
#cuz of error cuz my Windows terminal is using a standard Western encoding (cp1252)
sys.stdout.reconfigure(encoding='utf-8')

class TextNormalizer:
    def __init__(self):
        self.dialect_dict = {
            #question words
            "ايه": "إيه",
            "ازاي": "إزاي",
            "امتى": "إمتى",
            "مين": "مين",
            
            #daily needs & communication (AAC Focus)
            "عشان": "علشان",
            "عايز": "عاوز",      #standardizing to one form to help the TTS maintain a consistent voice
            "عايزه": "عاوْزَة",  #adding hidden diacritics in the value so we force the TTS to pronounce it correctly
            "مش": "مِش",         #forrcing the kasra so the model doesn't say "Mash"
            "مفيش": "مافيش",
            "ايوه": "أيوة",
            "لأ": "لا",
            "فى": "في",
            "علي": "على",
            
            #filler & transition words
            "طب": "طَيِّب",      #often gets butchered by TTS, spelling it fully with shadda works better
            "يلا": "يَلَّا",     #adding shadda ensures it doesn't sound like "Ya Allah" in standard Arabic
            "كدا": "كده",        #standardizing the end
            "كده": "كِدَه",      #forcing kasra and fatha for more fluency
            "بردو": "برضه",
            "اوي": "أوي",
            "بقا": "بقى",
            "دلوقتي": "دلوقتي",
            
            #greetings & etiquette
            "ازيك": "إزيك",
            "معلش": "معلهش",     #some models pronounce "معلهش" more naturally than "معلش"
            "امبارح": "إمبارح",
            "بكره": "بكرة"
        }

    def strip_diacritics(self, text):
        return araby.strip_tashkeel(text)

    def fix_letter_variations(self, text):
        #replaces all variations of alef with a bare one
        text = text.replace("أ", "ا")
        text = text.replace("إ", "ا")
        text = text.replace("آ", "ا")
        
        return text

    def remove_elongations(self, text):
        text = araby.strip_tatweel(text)
        
        #to remove repeated letters, looks for any character repeated 3 or more times in a row
        #and shrinks it to 1 character.
        text = re.sub(r'(.)\1{2,}', r'\1', text)
        
        return text

    def map_slang(self, text):
        #split the text into a list of individual words
        words = text.split()
        mapped_words = []
        
        for word in words:
            #.get() looks for the word in our dictionary if it finds it, it returns the mapped value
            #if not there it just returns the original word.
            mapped_words.append(self.dialect_dict.get(word, word))
            
        #combines the list of words back into a sentence
        return " ".join(mapped_words)

    def normalize(self, text):
        #basically our master switch, will take the text and pass it through all the steps above
        text = self.strip_diacritics(text)
        text = self.fix_letter_variations(text)
        text = self.remove_elongations(text)
        text = self.map_slang(text)
        
        return text

#TEST
if __name__ == "__main__":
    normalizer = TextNormalizer()
    
    # The ultimate boss-fight sentence:
    test_text = "طب أَهْلًااااا بِكُمْ فِى إِيجِيـــــبْت عشان كدة مَبْسُوطِين" 
    
    # Just flip the master switch!
    final_output = normalizer.normalize(test_text)
    
    print("Original: ", test_text)
    print("Final:    ", final_output)