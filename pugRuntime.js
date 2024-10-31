var pug_has_own_property=Object.prototype.hasOwnProperty;function pug_merge(a,b){if(arguments.length===1){var attrs=a[0];for(var i=1;i<a.length;i++){attrs=pug_merge(attrs,a[i])}return attrs}for(var key in b){if(key==="class"){var valA=a[key]||[];a[key]=(Array.isArray(valA)?valA:[valA]).concat(b[key]||[])}else if(key==="style"){var valA=pug_style(a[key]);valA=valA&&valA[valA.length-1]!==";"?valA+";":valA;var valB=pug_style(b[key]);valB=valB&&valB[valB.length-1]!==";"?valB+";":valB;a[key]=valA+valB}else{a[key]=b[key]}}return a}function pug_classes_array(val,escaping){var classString="",className,padding="",escapeEnabled=Array.isArray(escaping);for(var i=0;i<val.length;i++){className=pug_classes(val[i]);if(!className)continue;escapeEnabled&&escaping[i]&&(className=pug_escape(className));classString=classString+padding+className;padding=" "}return classString}function pug_classes_object(val){var classString="",padding="";for(var key in val){if(key&&val[key]&&pug_has_own_property.call(val,key)){classString=classString+padding+key;padding=" "}}return classString}function pug_classes(val,escaping){if(Array.isArray(val)){return pug_classes_array(val,escaping)}else if(val&&typeof val==="object"){return pug_classes_object(val)}else{return val||""}}function pug_style(val){if(!val)return"";if(typeof val==="object"){var out="";for(var style in val){if(pug_has_own_property.call(val,style)){out=out+style+":"+val[style]+";"}}return out}else{return val+""}}function pug_attr(key,val,escaped,terse){if(val===false||val==null||(!val&&(key==="class"||key==="style"))){return""}if(val===true){return" "+(terse?key:key+'="'+key+'"')}var type=typeof val;if((type==="object"||type==="function")&&typeof val.toJSON==="function"){val=val.toJSON()}if(typeof val!=="string"){val=JSON.stringify(val);if(!escaped&&val.indexOf('"')!==-1){return" "+key+"='"+val.replace(/'/g,"&#39;")+"'"}}if(escaped)val=pug_escape(val);return" "+key+'="'+val+'"'}function pug_attrs(obj,terse){var attrs="";for(var key in obj){if(pug_has_own_property.call(obj,key)){var val=obj[key];if("class"===key){val=pug_classes(val);attrs=pug_attr(key,val,false,terse)+attrs;continue}if("style"===key){val=pug_style(val)}attrs+=pug_attr(key,val,false,terse)}}return attrs}var pug_match_html=/["&<>]/;function pug_escape(_html){var html=""+_html;var regexResult=pug_match_html.exec(html);if(!regexResult)return _html;var result="";var i,lastIndex,escape;for(i=regexResult.index,lastIndex=0;i<html.length;i++){switch(html.charCodeAt(i)){case 34:escape="&quot;";break;case 38:escape="&amp;";break;case 60:escape="&lt;";break;case 62:escape="&gt;";break;default:continue}if(lastIndex!==i)result+=html.substring(lastIndex,i);lastIndex=i+1;result+=escape}if(lastIndex!==i)return result+html.substring(lastIndex,i);else return result}function pug_rethrow(err,filename,lineno,str){if(!(err instanceof Error))throw err;if((typeof window!="undefined"||!filename)&&!str){err.message+=" on line "+lineno;throw err;}var context,lines,start,end;try{str=str||require("fs").readFileSync(filename,{encoding:"utf8"});context=3;lines=str.split("\n");start=Math.max(lineno-context,0);end=Math.min(lines.length,lineno+context)}catch(ex){err.message+=" - could not read from "+filename+" ("+ex.message+")";pug_rethrow(err,null,lineno);return}context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");err.path=filename;try{err.message=(filename||"Pug")+":"+lineno+"\n"+context+"\n\n"+err.message}catch(e){}throw err;}