def log_exc(k):
    def decorator_function(original_function):
        def wrapper_function(*args, **kwargs):
            wrapper_function.count += 1
            if wrapper_function.count % k == 0:
                print("The decorated function has been called {} times!".format(wrapper_function.count))
            return original_function(*args, **kwargs)
        wrapper_function.count = 0
        return wrapper_function
    return decorator_function