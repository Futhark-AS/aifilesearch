import threading
def multi_thread_list(input_list, output_list, target, save, num_threads=10, start_index=0, save_every=10, lock=None):
    threads = []
    i = start_index
    while i < len(input_list):
        threads = []
        j = 0
        while j < num_threads and i+j < len(input_list):
            t = threading.Thread(target=target, args=(i+j, input_list, output_list, lock,))
            t.start()
            threads.append(t)
            j+=1
        
        for j in range(len(threads)):
            threads[j].join() 

        i+= num_threads

        # save to csv if we have 10 rows
        if i % (num_threads*save_every) == 0:
            print("Saving up to index: ", i)
            save(output_list)



    print("Final save")
    save(output_list)