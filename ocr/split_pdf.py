from PyPDF2 import PdfWriter, PdfReader
import os


save_folder = "michael_pages"
pdf_name = "michael"
inputpdf = PdfReader(open(pdf_name+".pdf", "rb"))

if not os.path.exists(save_folder):
    os.makedirs(save_folder)
else:
    for file in os.listdir(save_folder):
        os.remove(os.path.join(save_folder, file))



n = 2
start = 15
end = 50
for i in range(start, end, n):
    output = PdfWriter()
    for j in range(i, i+n):
        output.add_page(inputpdf.pages[j])
    with open(save_folder+"/"+pdf_name+"-%s-%s.pdf" % (i, j), "wb") as outputStream:
        output.write(outputStream)