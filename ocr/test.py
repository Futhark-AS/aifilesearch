from transformers import (
    TrOCRConfig,
    TrOCRProcessor,
    TrOCRForCausalLM,
    ViTConfig,
    ViTModel,
    VisionEncoderDecoderModel,
)
import requests
from PIL import Image

import matplotlib.pyplot as plt
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, TrOCRConfig, TrOCRForCausalLM

import requests
from PIL import Image
from PyPDF2 import PdfReader


# get the pdf file named michael.pdf and extract each page as an image

# Open the PDF file
images = []

with open('finanzas.pdf', 'rb') as f:
    pdf = PdfReader(f)

    # Get the first page
    pages = pdf.pages[0:10]
    for page in pages:

        print("Page: ", page)

        # Extract the image
        xObject = page['/Resources']['/XObject'].get_object()
        print("xObject:", xObject)

        for obj in xObject:
            print(obj)
            if xObject[obj]['/Subtype'] == '/Image':
                size = (xObject[obj]['/Width'], xObject[obj]['/Height'])
                data = xObject[obj]._data

                if xObject[obj]['/ColorSpace'] == '/DeviceRGB':
                    mode = "RGB"
                else:
                    mode = "P"

                print("Mode:", mode)
                print("Size:", size)
                print("Filter: ", xObject[obj]['/Filter'])
                if xObject[obj]['/Filter'] == '/FlateDecode':
                    print("PNG")
                    img = Image.frombytes(mode, size, data)
                    img.save("images/" + obj[1:] + ".png")
                    images.append(obj[1:] + ".png")
                elif xObject[obj]['/Filter'] == '/DCTDecode':
                    print("JPG")
                    img = open("images/" +obj[1:] + ".jpg", "wb")
                    img.write(data)
                    img.close()
                    images.append(obj[1:] + ".jpg")
                elif xObject[obj]['/Filter'] == '/JPXDecode':
                    print("jp2")
                    img = open("images/" + obj[1:] + ".jp2", "wb")
                    img.write(data)
                    img.close()
                    images.append(obj[1:] + ".jp2")
                else:
                    print("Unknown")


for img_file in images:
    print("Handling image: ", img_file)
    img = Image.open("images/"+img_file).convert("RGB")

    # # load image from the IAM dataset
    # url = "https://fki.tic.heia-fr.ch/static/img/a01-122-02.jpg"
    # img = Image.open(requests.get(url, stream=True).raw).convert("RGB")

    # display the image with matplotlib
    plt.imshow(img)
    plt.show()


    # processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
    # model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
    


    # pixel_values = processor(img, return_tensors="pt").pixel_values
    # generated_ids = model.generate(pixel_values)

    # generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    # print(generated_text)

    # TrOCR is a decoder model and should be used within a VisionEncoderDecoderModel
    # init vision2text model with random weights
    encoder = ViTModel(ViTConfig())
    decoder = TrOCRForCausalLM(TrOCRConfig())
    model = VisionEncoderDecoderModel(encoder=encoder, decoder=decoder)

    # If you want to start from the pretrained model, load the checkpoint with `VisionEncoderDecoderModel`
    processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
    model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

    # load image from the IAM dataset
    # url = "https://fki.tic.heia-fr.ch/static/img/a01-122-02.jpg"
    # image = Image.open(requests.get(url, stream=True).raw).convert("RGB")
    pixel_values = processor(img, return_tensors="pt").pixel_values

    # training
    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.vocab_size = model.config.decoder.vocab_size
    model.config.max_length = 128

    # inference
    generated_ids = model.generate(pixel_values)
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    print(generated_text)