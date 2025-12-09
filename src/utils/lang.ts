export const getLang = (headers: Headers) => {
    const lang = headers.get("accept-language")
    return lang?.startsWith("en") ? "en" : "vi"
}
