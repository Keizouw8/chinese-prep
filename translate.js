const translate = require("google-translate-api-x");

module.exports = function(req, res){
    if(!req.body.from || !req.body.text) return res.status(400).end();
    var isEn = req.body.from == "English";

    translate(req.body.text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), { from:  isEn ? "en" : "zh-CN", to: isEn ? "zh-CN" : "en" }).then(function(translation){
        if(isEn){
            res.json({
                English: req.body.text,
                Pinyin: translation?.pronunciation?.toLowerCase()?.format() || "",
                Chinese: translation.text?.format() || ""
            });
        }
        if(req.body.from == "Chinese"){
            res.json({
                English: translation.text?.toLowerCase()?.format() || "",
                Pinyin: translation.raw?.[0]?.[0]?.toLowerCase()?.format() || "",
                Chinese: req.body.text,
            });
        }
        if(req.body.from == "Pinyin" && translation.from.text.didYouMean){
            var chinese = translation.from.text.value.replaceAll("[", "").replaceAll("]", "").format();
            translate(chinese, { from: "zh-CN", to: "en" }).then(function(translation){
                res.json({
                    English: translation.text?.toLowerCase()?.format() || "",
                    Pinyin: translation.raw?.[0]?.[0]?.toLowerCase()?.format() || req.body.text,
                    Chinese: chinese
                });
            });
        }
    });
}

String.prototype.format = function(){
    return this.replace(/<[/a-z0-9]+>/g, "").trim();
}