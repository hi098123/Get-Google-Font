const fontverter = require('fontverter');
var fs = require('fs');
const http = require('http');

const options = {
	headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36' }
};

const url='http://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&display=swap';//not https

http.get(url, options, function(res) {
	let rawData = '';
	res.on('data', (chunk) => { rawData += chunk; });

	res.on('end', function() {
		mkdir( './out/fonts' );
		var css=rawData.toString();
		css=css.split("format('woff2')").join("format('woff')");

		var css_list=css.split('src: url(');
		var len=css_list.length-1;
		for(var i=0; i<len ;i++){
			const num=i.toString();
			var u=css_list[i+1].split(')')[0];
			css=css.replace(u,`./fonts/${num}.woff2) format('woff2'), url(./fonts/${num}.woff`);
			http.get(u, options, function(res2) {
				var file = fs.createWriteStream(`./out/fonts/${num}.woff2`);
				res2.pipe(file);
				file.on('finish', function() {
					file.close(function() {
						download_woff(fs.readFileSync(`./out/fonts/${num}.woff2`), num)
					});
				});
			})
		}
		fs.writeFileSync('./out/font.css', css, 'utf8');
		console.log('finish css');
	});
});

async function download_woff(buf,i) {
	try{
		var f=await fontverter.convert(buf, 'woff');
		fs.writeFileSync(`./out/fonts/${i}.woff`, f, 'utf8');
		console.log(`success : ${i}.woff`)
	}catch(e){
		console.log(`fail : ${i}.woff : ${e}`)
	}
}
function mkdir( dirPath ) {
    const isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}