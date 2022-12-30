n = 2
start = 15
end = 50
save_folder = "michael_pages"
pdf_name = "michael"
# open a new file in write mode
with open(save_folder+"/combined.txt", 'w') as outfile:
    # iterate over the range of numbers with a step size of 2
    for i in range(start, end, n):
        # generate the file name
        filename = save_folder+"/"+pdf_name+"-%s-%s.txt" % (i, i+n-1)
        # open the file in read mode
        with open(filename, 'r') as infile:
            # read the contents of the file
            contents = infile.read()

            # remove the trailing newlines
            contents = contents.rstrip()
        
            # write the contents to the output file
            outfile.write(contents)

# the combined.txt file now contains the contents of all the files
