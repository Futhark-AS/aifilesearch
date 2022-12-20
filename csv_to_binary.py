import pandas as pd

path = 'data/fine_food_reviews_1k'

# Read the csv file
df = pd.read_csv(path + ".csv")

# Write the binary file
df.to_pickle(path + ".pkl")

# Read the binary file
df = pd.read_pickle(path + ".pkl")

print(df)

