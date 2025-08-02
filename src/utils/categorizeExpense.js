export const getCategory = (name = "") => {
  const keyword = name.toLowerCase().trim();

  if (
    keyword.includes("yakıt") ||
    keyword.includes("benzin") ||
    keyword.includes("mazot")
  ) {
    return "Yakıt";
  } else if (
    keyword.includes("yol") ||
    keyword.includes("otoyol") ||
    keyword.includes("köprü") ||
    keyword.includes("geçiş")
  ) {
    return "Yol";
  } else if (
    keyword.includes("bakım") ||
    keyword.includes("onarım") ||
    keyword.includes("servis") ||
    keyword.includes("lastik")
  ) {
    return "Bakım";
  } else if (keyword.includes("sigorta") || keyword.includes("kasko")) {
    return "Sigorta";
  } else if (
    keyword.includes("yemek") ||
    keyword.includes("restoran") ||
    keyword.includes("kahvaltı") ||
    keyword.includes("öğle") ||
    keyword.includes("akşam")
  ) {
    return "Yemek";
  } else if (
    keyword.includes("telefon") ||
    keyword.includes("elektrik") ||
    keyword.includes("su") ||
    keyword.includes("gaz") ||
    keyword.includes("internet")
  ) {
    return "Faturalar";
  } else if (keyword === "fatura") {
    return "Fatura";
  } else {
    return "Diğer";
  }
};
