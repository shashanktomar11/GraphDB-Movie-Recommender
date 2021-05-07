import csv
import pandas as pd

l = []
d1={}
# d2={}
# d3={}
# for f in ["users.csv","hashtags.csv","tweets.csv"]:
f='links_small.csv'
g='ratings_small.csv'
# a=f.split('.')[0][:-1]
# a=a[0].upper()+a[1:]
# if f.startswith('u'):
#     x="name"
with open(f) as csv_file:
    reader = csv.reader(csv_file, delimiter=',')
    for e in list(reader)[1:]:
        # print(e)
        d1[int(e[0])]=int(e[1])
        # print()

# print(d1[1])

df=pd.read_csv(g,index_col=0)
print(df)
df["movieId"].replace(d1,inplace=True)
df.to_csv("ratings.csv")
# for row in df['movieId']:
#     print(row)
# print(df)
# with open(g) as csv_file:
#     reader = csv.reader(csv_file, delimiter=',')
#     for e in list(reader)[1:]:
#         print(e)
    # d1[e[0]]=e[1]
# print(d1)
    # l.append("CREATE (:"+a+' { '+x+': "'+e[1]+'" });')
# elif f.startswith('h'):
#     x="tag"
#     with open(f) as csv_file:
#         reader = csv.reader(csv_file, delimiter=',')
#         for e in list(reader)[1:]:
#             d2[e[0]]=e[1]
#             l.append("CREATE (:"+a+' { '+x+': "'+e[1]+'" });')
# else:
#     x="text"
#     with open(f) as csv_file:
#         reader = csv.reader(csv_file, delimiter=',')
#         for e in list(reader)[1:]:
#             d3[e[0]]=e[1]
#             l.append("CREATE (:"+a+' { '+x+': "'+e[1]+'" });')
# # print(d1)
# # print(d2)
# # print(d3)
# for f in ["contains.csv","follows.csv","mentions.csv","sent.csv"]:
#     a=f.split('.')[0]
#     a=a[0].upper()+a[1:]
#     if f.startswith('f'):
#         x="User"
#         y="User"
#         g="name"
#         with open(f) as csv_file:
#             reader = csv.reader(csv_file, delimiter=',')
#             for e in list(reader)[1:]:
#                 l.append('MATCH (p1: '+x+'{ '+g+': "'+d1[e[0]]+'"}), (p2: '+y+'{ '+g+': "'+d1[e[1]]+'"}) CREATE (p1)-[:'+a+']->(p2);')
#     elif f.startswith('s'):
#         x="User"
#         y="Tweet"
#         g="name"
#         h="text"
#         with open(f) as csv_file:
#             reader = csv.reader(csv_file, delimiter=',')
#             for e in list(reader)[1:]:
#                 l.append('MATCH (p1: '+x+'{ '+g+': "'+d1[e[0]]+'"}), (p2: '+y+'{ '+h+': "'+d3[e[1]]+'"}) CREATE (p1)-[:'+a+']->(p2);')
#     elif f.startswith('m'):
#         x="Tweet"
#         y="User"
#         h="name"
#         g="text"
#         with open(f) as csv_file:
#             reader = csv.reader(csv_file, delimiter=',')
#             for e in list(reader)[1:]:
#                 l.append('MATCH (p1: '+x+'{ '+g+': "'+d3[e[0]]+'"}), (p2: '+y+'{ '+h+': "'+d1[e[1]]+'"}) CREATE (p1)-[:'+a+']->(p2);')
#     else:
#         x="Tweet"
#         y="Hashtag"
#         g="text"
#         h="tag"
#         with open(f) as csv_file:
#             reader = csv.reader(csv_file, delimiter=',')
#             for e in list(reader)[1:]:
#                 l.append('MATCH (p1: '+x+'{ '+g+': "'+d3[e[0]]+'"}), (p2: '+y+'{ '+h+': "'+d2[e[1]]+'"}) CREATE (p1)-[:'+a+']->(p2);')

# with open("load-data.cypher", 'w') as file:
#     for e in l:
#         file.write("%s\n" % e)



