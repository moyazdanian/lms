export function convertHeroiconName(heroiconName) {
    if (!heroiconName) return "QuestionMarkCircleIcon"; // fallback
    
    // نمونه ورودی: "heroicon-s-academic-cap"
    const parts = heroiconName.split("-");
    if (parts.length < 3) return "QuestionMarkCircleIcon";
  
    const style = parts[1]; // o, s, m
    const nameParts = parts.slice(2);
  
    // تبدیل "academic-cap" به "AcademicCapIcon"
    const componentName =
      nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("") + "Icon";
  
    return componentName;
  }
  