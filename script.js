const apiKey = 'Your_Key'

async function enviarImagem() {
    try {
        var loader = document.getElementById("loaderImg");
        loader.style.display = 'block';
        var imagem = document.getElementById("imagem").files[0];
        document.getElementById("imagem-enviada").src = URL.createObjectURL(imagem);
        var reader = new FileReader();
        reader.readAsDataURL(imagem);
        reader.onload = async function () {
            let response = await fetch(
                'https://vision.googleapis.com/v1/images:annotate?key='+apiKey,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [
                            {
                                image: {
                                    content: reader.result.split(',')[1],
                                },
                                features: [
                                    { type: 'LABEL_DETECTION' }, 
                                ],
                                imageContext: {
                                    languageHints: ['pt'], 
                                },
                            },
                        ],
                    }),
                }
            );

            let data = await response.json();

            
            let descricao = 'Descrição:\n';
            if (data.responses[0]?.labelAnnotations?.length) {
                data.responses[0].labelAnnotations.forEach(label => {
                    descricao += `- ${label.descricacao}\n`;
                });
            } else {
                descricao += 'Nenhuma descricao encontrada.\n';
            }
        loader.style.display = 'none';
        document.getElementById("descricao").textContent = descricao;
        };
    } catch (error) {
        document.getElementById("descricao").textContent = 'Erro ao buscar descricao';
    }
}

async function enviarVideo() {
    try {
        var video = document.getElementById("video").files[0];
        var videoURL = URL.createObjectURL(video);
        var videoElement = document.createElement("video");
        var loader = document.getElementById("loader");
        loader.style.display = 'block';
        videoElement.src = videoURL;
        
        
        videoElement.onloadeddata = async function() {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");

            
            var fps = 1; 
            var interval = 1000 / fps; 
            var quadroVideo = 10;

            while (quadroVideo < videoElement.duration) {
                
                videoElement.quadroVideo = quadroVideo;

                
                await new Promise(resolve => {
                    videoElement.onseeked = resolve;
                });

                
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Enviar o quadro para a API do Google Vision
                var imageData = canvas.toDataURL("image/jpeg").split(',')[1]; // Extraindo a base64 da imagem

                let response = await fetch(
                    'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            requests: [
                                {
                                    image: {
                                        content: imageData,
                                    },
                                    features: [
                                        { type: 'LABEL_DETECTION' }, 
                                    ],
                                    imageContext: {

                                    },
                                },
                            ],
                        }),
                    }
                );

                let data = await response.json();
                let descricao = 'Descricao do quadro em ' + quadroVideo + ' segundos:\n';
                if (data.responses[0]?.labelAnnotations?.length) {
                    data.responses[0].labelAnnotations.forEach(label => {
                        descricao += `- ${label.descricacao}\n`;
                    });
                } else {
                    descricao += 'Nenhuma descricao encontrada.\n';
                }
                loader.style.display = 'none';
                // escrevendo a descricao no front
                document.getElementById("descricaoVideo").textContent += descricao;

                quadroVideo += interval;
            }
        };
    } catch (error) {
        document.getElementById("descricaoVideo").textContent = 'Erro ao carregar o video';
    }
}
