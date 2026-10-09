import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, X, Check, Calendar, Users, Clock, ChevronRight, RotateCcw,
  Trash2, AlertCircle, GraduationCap, Pencil, ArrowRight, Loader2,
  Send, BookOpen, MessageCircle, Paperclip, Building2, LifeBuoy, ShoppingBag, Inbox
} from "lucide-react";

const LOGO_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZgAAAGBCAYAAABb4qcGAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAEFSSURBVHgB7Z3LkhNJmu8/DymTnKox6+wnqGBRZsOlToknKHG62+zsKjkFTNlsEKvqnl6QPAHJE5AsZmqqNik2x9qAbpLdMeueQTwB4hSQbdYLgico9aYmSUnh5/tCLkqplJRyj4vi8v+ZCQmlbhHh7v/v4v65IgDAUrz4+mt/fTC4QUr7mvTzi4/+1CYAwFwUAQBO5dVXX93wat4uP9yceDp4f9S/fGl/PyAAwAk8AgAsRDyXGeIi+GfW1vYIADATCAwAp3Am7DfopLiMUNR8sbW1SQCAE0BgADgFTaqx6O8b88QHgIoDgQEAAJAKEBgAAACpAIEB4BSUoh4BAKyBwABwCsMhdRf8OTiHacoAzAQCA8ApfPb4cYfvZoqMJvWAAAAzgcAAsATKq13RWj+deKoXhvr2hYcPdwgAMBOs5AfAgoOvv/aH3nCz/1M/uLS/j9wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwEwwTRlUGlNqf7Ner/tKKd/z9KZS1D33h2hxpROvrl1ryX0Yhj3+zN5gMAiwKRmoIhAYUHpERNbW1nx+2FBK+6T1J9z0GyIoNFVqX5O6e9riyR+uXm2a1f1zv+/Men2Xv+PGsc/WuqtkgSbpl56nAilBw+LTxXoaUFYgMKB0sAfRYE+kqUP9uRGSxjLvk5X5Fx8/3p33d9nZ8sxwsEdKNbWm9lG/f3eRZ/L6+vUdRfoOnU6P1aerFT0fDnV3OBx2IDqgDEBgQOERj8Ij+oJDW00aiYntBmA95ekri8Ji/++rr7bqNW9v6rOD90f9y4tE5tXVq9vsrdwjS8Tb4e7Z1TR83u+HHYTYQBGBwIDCEYWgztRbFNKXjoIySRBqunLx0aO5FZPfXL/OAqG35/2dPaWdC48f3533d8nJeIr2KAYiOJr0c63V/qLwHAB5AgIDCgGLir9er98wXkqTkiFQ7IHMK7cfCdla/cly36d2zz98eHveX6OwnaJnlMz2yj0O0e0Pw/Dp//jjH/cJgJwCgQG5RQZ4FpVbCYvKmMXiIvmWMGRB0D4tCQ/6Xc7LXJkXzkpYZMZEYhNq/QCeDcgbEBiQOySnUlN0JwVRGbNQXGIKwcK8TEoi8+G7WWw6p00+ACArIDAgF3zwVjwluY40Bt8xi8Xlq69ueDVvN+ZvOE1kYudkTkXrTkjhg4uP/tQmAFYEBAaslAy8lUl6nNC/PC+hb8SlTQnAnkRP04LvykJkRgShHt7t98N9TH0GWQOBASshY2GJYHG5yQN+e9bfkhSXMaeJjMU6mSQI+ATsvx8M7iN8BrICAgMyZRXCIixaoZ+GuHz43tM8mevX2x7pG5QhyywSBSAJIDAgE1YlLILiAfXco0c3Z/3NJN1fULrMzcmMysqsSdJ/qWoDSSLrd44GgwcQGpAWEBiQKqsUFoMM7pdm5R9GU5GHIi5pTiqY/B0zReaAf4fO7ndME4Shvr+oRA4ArkBgQCqMLPP1O4tWwGeBOuqfnTVjzGWdS1zMOpnLs8TuzfWvtoi8J7Q6oskAmHUGksQjABJG6m9x2OftqsVFilfOm468Phw+yVJcBKWoMRLdk5x/+Mf9UNN9Wh2+p2p7b65feyJVEwiABIAHAxIjymeQvrfCcNgHFuVdTqstljbzqjYbr+9F1sI3i9PqqwGwDBAYEJu8hMMmmLuYMsP1Jwthb+XSrJllUc7KU88oH5xaLRqARSBEBmIhA6KxuvMiLiS5hHl5FxYX69L5acC/44nZTfMYUk9sxaGySXwJdb6+ejWrtTqgZEBggDMy8Iys7dWHdCYI5iWqR0n9lczUmoU/Lx/T7/d3OLgQUE5Qntrh3Mxb5GaALRAYYI14Am+uXX0mAw/lDAmNzXp+ZIXnSghJvD7xAKefHc0yG96mfAFvBliDHAywYs7OjrlgXmLfrHd5S/lk7jqdN9euPSPZqiBnoBIAWBZ4MGBpZPYVi4us1ciduJDsa8+D3qw/rIWDHcov/vp6fWb+aqh1LmdxKUUtqT6AkBk4DXgw4FTsdnZcDfNqjeVl1thpsBdzdpZHkFcvRojqrLEIogoAmAc8GLCQKLwks8RyLC5M4B0dtWf9wVOqEDmDM2trM0Uwr16MwJ7Mpuepe8jLgHlAYMBcoinIUY2svCXHj8Pey4N5a17y/ts/wF7KrIR/tA2ypg7lGJns8fratb1Z065BtYHAgJlIuRez4C/3g0bRvZcxtTm/N89ezBjJy6yvIS8DjgOBASeQkIeEPqgARDPHiu69jCmwFyOMaq1BZMDPQGDAMURc8ri+ZS5zZo4VzXsZU2QvxuBDZMAYCAz4QNHERWv9tDTey5hFXoxMxS4GEBkQAYEBEYXzXEhCMro96/miei9j5nkxmnReapQtQyQyUmGbQGWBwIBCigsTyB4q00+OrP+Cei9j2IuZNSPr6GhQtPUmvinq6ROoJBCYilNQcZHkfmfm8x61qATMWt0flZMpQLJ/CoTLKgwEpsIUVVyEIZ0saR+V4yd1g8qAVrdmPR3W6AEVD4hMRYHAVJQiiwtFJflPbta1Nhw2qSTIKvlZyf7+YV/CgkVJ9k8CkakgEJgKIhWRCywuFOrw6aznPdLl8F4MSumt6edMmKxLxcRfX1t7ghX/1QECUzEkjGTK7RcYrz39jBxXzuulWaPImymYBQ2TRchiTBaZQiziBfGBwFSI0b4oudrV0YXSh8fGnBImKyxSVgYFMqsBBKZCjMSl2FN4580eK1t4bMyCMFmHCoyEaA+++qqU1wz8DASmIshmYYVfH0Iyuepk/iWK6ZcsPDZmXphMK/2cCk7oebtI+pcbCEwFkMrIsv87lYD3R8PO9HNn1mtNKikSJjuYMQiHYbE9GEGOzcwsQ9K/pEBgSk60NqQglZGXoDtr7/qQ1BaVmGG9fuL4BoOB5KGKOF15Gh9J//ICgSkx0VbHo6R+KQh1ODMs5JH6nEqMmrFlcsGnKx9Dkv4jLxuUDQhMiTmzvn6nDHmXMZ46GRaKpicTlbygovpi1rMh0UsqCUqpO8jHlA8ITEkxJetLZRWG2gumnzsT9ktfrXdeHsZTYYdKQpSPWVsr+PosMA0EpoREeZeCl6yfRmvqzVr/wqLTpAowXPOa088pb60UIbIPcCgQobJyAYEpIWvhYKdMoTGBLdyZ4SCPdKnzLz+jTnhq5/7wh4DKkej/AEJl5QICUzJk5XdpKgpPwAn+2da6UpXY0MpT3sw8jNbFXw8zCUJl5QICUzJqXtHrjM1mVoLf7JZYiTUUHCL0Zz5PKqCygVBZaYDAlIhRfadyhcbGKE+dCAVxktunijAv0U+1ckxVnsaEyrAAs+BAYEqCJPZ5EC6t1Xd4ODg5kCrlU4XQ67WT4cBhWQVGVvmvoyBmwYHAlIRRYr+c4SKZQTZrBT/HhyqRfxkThsqffq5Wq5UqyX8cvY2Ef7GBwJSAUm0VPIN5M8hYYD6hKqFOhj/LOJNsEiT8iw0EpgScCYelruWktZ45gGpPnaUKoUj5s57Xiv5OZYUT/rP2xAHFAAJTcEznK3WxRx5kZuYZVMU8GE58z17zE+pS5mHG1Eq2aLhKQGAKTk1R6TufDk+GgA5GNcgqBeeiZubYOIRY4jwMwYspMBCYAhN1upJutDWJ5+lg+rnBYOBTxZCZVbOm7mqigEoOvJhiAoEpMFXwXoRZa2Bqnq7kGomNGTMFORcVUNmBF1NIIDAFJSpTXwHvRRgOTwpM1dbAfGCj7lNFgRdTPCAwBcWse6kE/X4/mH5uXj6i7AyHJ6sX6MHJEGIpYS8G62KKBQSmgJR93cs0sxZZaq1QRsSglCp3kn+C9fV6i0BhgMAUkLXBoNzTkpfAU9XMwSjl+dPPlXs1/xRa3UKNsuIAgSkgnufdouoQzHqyqiGyWRweHlZGYGQm3VodXkxRgMAUjDfXv9oqa8VkGxTRL6iCaH3Sc5tZp63EeEp9SaAQQGAKRkiqauGxfAyeit7NvGX8+2oVFdZjyH4xo72AQM6pEygMUXI/HKaR3JdB8qXsGlmreV0dhj3lDbuHh3OqGJOspJfZPHVfh3pTy3a+SjWUllImiXtXWdbZ6mlFz/n4AzkPQ4+6/Z/6wTIewqt/udaoybmQCs98k3PCXlaRt3PuaaJ3WocdT9bZaB1Im5A/nPvDfjDrDZNtQqaR8zlo8rnw0zgPSmkxtEpdIqcMQGAKxNpw2JTYUEI8J6X3w5rqXPw/j6w7qhlkAvPf/fHzUsJlyL+Tk/BNHgYklJFKrkQKXSpNSRDrPIyZeG9n/Jwko8+s15oUeZ3pnQuBhfFdArXZnrMosKCEHdl/xzb0NtUmhF355/h5kK2fEzBCONnP/+4QyDUQmALhkb5B8RQmGkzfvx+004rbm/LxbXMzOaNogM3TtGq2ztX9o6Oj3TTzF+az980tOhdaeS0WgjzlEKJz4XlH7XmeSVymz8PB11ebOqRWHNGVZL+s7P/s8eMOgdwCgSkI0cr9kD0YN54rT++c+0P2nfH8wz9GAwt7Njs6WhyakAXrxsrOgzBxLvzRubAXXRaopLYoWNm5MN/ZEc9mbW1ty4tW6Nu3CRMm6xDILRCYguAYHlvpgDqJ8WxaJoS27SnKcqo15w/0zTycB2HiXOy4Ck0McnMujGfTlhsn7Vu2QuMpTzygbQK5BbPICoIibTN7TAaRy+cfPmrmZVAdI4PrxUePtpVXO8sJ4A6lDId/7r4/6l/K23kQ5Fycf/i4FWq6xFc4oHTphaG+zW3ibB7PBbeJtvK8y3zFHli8zT9A6ZhcA4EpCEqpL5Z85YO8DqiTRIPro0eXZdCjdAhk4L7w8OFO3teJ8ODaPf/w4VkRQ0oBramruE1cfPx4l3LMWHCJwivLCu6wXq98VYs8gxBZATBlyk9NhspgffHxo1wPItPIoMehon0dhs+Sy82o/fdHRzeTFpY3/3x1W4f6c9m6OCT9st8fyiSBgBJCxPDV1as9z4uqBs/eXEyHb8kCFtn74jFSgZBcFbeJrg6HT/i/C9e7mEWXhWrzVQIeTAHwPGqe8pKehMTybqHOQyzXUXgkfphIBlT2Bq4kKS4yweLN9etvOcN+TymvJdskcPz/1pn1tbevr15NtIS8XEM+hkTOhXhERROXMSNv5tGlkD3yRa/TpwgQWC0QmAKgNC0Kj/VkQMp7SOw0ZEBhr4NzEcstnuNz8uP0c2kNqGcWeFfKU+J1JPqdEjIbCe7yVQKm18DIuRCPiArOxYcPW4tEZjxdmUAugcAUAaXmWmkiLjIgUQkQr4OT/9Px99mlUbQ+NviK55LGgCqzm04L3XF+7E7SFX5FcEeejH0pmrKIyxgRGQl7zvu7gheTWyAwOWdR/iXKuZREXMb8HC77MLAuM3AHaYWCRotbFyNWdL1eT3yQk2vL1/hY4n94Sukc9mTaZRKXMZJTmxc25PPfJJBLIDA5p1abbZ3JQFLUnMtpRNb71MA6jZ4YaNVR/zKtGKVO7jSZBFFOZiJENGtzsQnvKTjs99OalbdSxLsNtWbvdpZHt+wMS5A1EJicE+qZAhNQv5/KlNa8EImnps68fV/Yao0GGgkHndtPp8RJXugfHYl3NjdUtrGxYc5ReLvMpfvFo9Ok708/Lx4k1sPkEwhMzvFInahEG+ph6QdVQdVqN2XwWPCSoIzhoGlENMYDqw5nC414tKYUTak5OhrszgqV6fUa8jA5BAKTf6Y7Ducb/tSmCjAqqTJ7ZbeOFlIOS+3FTTIaWFlcVHhCYAaDgV92j3ZM5KGp8IQXE4bKJ5A7IDA5ZtamStqulEbhGYbUnhX+EEu+KkIrjL2YWs0Lpv8mFYWr4NGOkWrgNBUyrCld5L13SgsEJsd4MxLH3lHUuSrDvMGzP6jWeRA8r94mYBL+dMzQ0spDiCyHQGDyjFL+1DPdKlmqi6jaPvSChAxlIzACYnx1Jv+vNfkEcgcEJsdMx5U5kYvBpeJUUVhn8f5o2Jn8v0wGSXqxK4gPBCbHeHQ8rjzU+iUBAEY5KUXvJp9bW1vzCeQKCEyeUeqYReZ5OiAAQMR0PTovpcWuwB0ITJ7RNFVv6+QMIgCqitb6HYFcA4HJMbLQUBNJWKxXxrpjAMRBk9qJ+geHykbbNJR/oWnRwIZjOcbs3Y7plwDMwBhc6B85Bh4MAACAVIDAAAAASAUIDAAAgFSAwAAAAEgFCAwAAIBUgMAAAABIBQgMAACAVIDAAAAASAUIDAAAgFSAwAAAAEgFCAwAAIBUgMAAAABIBQgMAACAVIDAAAAASAUIDAAAgFSAwAAAAEgFCAwAAIBUgMAAAABIBQgMAACAVIDAAAAASAUIDAAAgFSAwACwAE3092VeV6t5AQEAjgGBAWARirpLve5wEBAA4BgQGAAWcHQ02OW73qLXhJrun9vfDwgAcAwIDAALuLS/32MBuUzzReZ5v9/fIQDACRQBMIMXW1v+2traJj9seJ7e1Jo2SetP5G+KlB+9SJn7WWgdfHhIOpBchlKqp7UKNP9tMBgElwpk9R98/bWvw8GOJtVQSs4FBaEeti8++lObCgBfT7mWm7Vaja+nt6mU9m2uJ1+znjIiO+t6ymMWWrmmPQLAAIGpOK+uXWvwHd/Chqe8T0aPadPcUocHpy4PTjxg6ZfDoe7y4BdcfPRoubwHOIEICRsGPhsFzTDUvkfqcyMcPmVDjy9ql7+zR0o/Hw6py8ZEF8JTTSAwFcJ4JU0RE7Zav1CjgScTIbEkGqS0oudhSJ3PHj/uEJiJEZStiWvaoHxy7JpCdKoBBKbEiHcilixp9QX/t0n5FJPl0LrDGcOnYag6VfZwRFDq9TqH6fQWe5xfUnaeSeKI98pDUHcYhk+Hw2EHglM+IDAl44erV5ue0jeU8tiqLbCgLIbj/tQJtX5QBe9m7KV4pG/QyEMp5XUVweFQ6fN+f7hbpPwcmA8EpmS8uX7tRyqvsMwiEhtOOt8vk2cjonJmvSbe560yi8osWGTuXnj4eIdA4akTKBtVEhfBV4pabCm1Xl+7yhZweL/fDztFtYDFAzXhrxsk17KCJqBnZreB4gOBKRGjqbRDqiqS4FZU22PLn15fu9YuilczFQJrIrAAygIEpkRwonTTw9gUMfZq3ly72gkpfJDH9SoiLOv1+i3lqW2KPE9cPEEr7yyBUgCBKRGcJN2UkRVMwB6BR7Um56buhHp4Nw9C84I9zfXB4MbPwgKmQIisJEBgQFXwPVXbW6XQiLCshYMdLxzeILiaoAKgFlmJUHXlEziNsdC8fXXtf7coAyQU9ub69XtnwuFbj9QNAqfhEygFMKNKxJt/vrrNAex7BGwI0vJoTuZYwLK8P+r/Egsviw88mBIRFaQEtow9midSSocS4tXVq9tn1tfesrjsEMTFmg2cs1KAHEyJUAgtxGGLBWFLpjcf9ft3XdfRyDqWmqI7o+nGwJXhqJI3KDjwYEoEPJj4yPRmFppntvmZcZ6l5qlnEJf41GoabbkEQGBKBHswvyCQBKOw2bVrz5YJm43DYSzx2wQSYTgMfQKFBwIDwDwUNUU4Xl+9emfWn2Xa8ZtrV595XjSxAhY3AFNAYEqE9hRWQKeAJOplWvOkNxN5LeHwBcJh6aCU5xMoPEjylwilESJLET/yZq5fvcvn+QsIS7pEVSlA4YHAlAt0ypRRpO5g9Vj61JBPLAUIkZUEqaRMAJSEkNQvCRQeCExJkErKBEBJUEqhPZcACExJQMwalAxUVC4BEJiSUPMgMACAfAGBKQmh50FgQJnwCRQeCExJUKH2CYASIeV3CBQaCAwAIJegonLxgcCUBFRSBmUDFZWLDwSmJKCSMigbqKhcfLCSvyRkUEm5x1/y9w//0xT8/JA2lTICNypXg4GhyCh6N37IhktPybX/+W/+h8c63anEqKhcfCAwZcF9YVqPBeKdIt0Nte55ngqUUr2hR91a2O8dHlLPZetaSdCufbTm10K9qeVGqjEK4ym+0ecEEVoNLB58vbs6DAO51qwgQVj3ArnW5/7gtsnawddb/tBb25RrLdc3DLUv67I85TUi42N0vUEFgcCUBK3ol0ovfEkkJFqHnZGIUPfwcNBNa99z87ndiaf2J/8uArSxUW+EITVZHBtRAUmITqLw9X4phoPyVEcMhv5P/SCN672MML36l2sNbxD6YmjI9eYf558mPKioXHxQtq8kvLl+7UeaGKBlcBExqdU8HuT7HVfrNEtkEKI+NZRHWxAcB9g7CcNw31PUeX807KRlPCTF2MjgMBx7OqqptGLB+Xm6vSZ998LDxzsECgsEpiS8unatxaEt3/PCTpqeSZYcfH21qUNqEXlfTA484BjPSel9pQb7RTAiTkOKtg6HwyZR2Kj1h7vn9ot/TFUGAgMKwc9io74keDbP2eLvHB0d7ZbBkADlBQIDCod4axwGavHDL6g69EIdPqjVFHsqjzsEQAGAwIDCIuEUHQ52uBnfoPLSY2/lPrwVUEQgMKDw/Cw0pcrVPOc8xO75h3/cJwAKCgQGlAYRmjAMW9yobxRYaJ4rT+8gDAbKAAQGUHNvb5MODzfrFK1NiBbJycJNPVq8ubBCgNI6WvXN7wtCz+upMOwN+HHnd78LaEUUNHQWsLDcXLWwNL/91l8Lw03teZvj+nZ6iTp3cv3NawNpA/2PPgo6N28ipFdxIDAVQgaPmuc11HDo8wDyuZIFb6PBI5VZWTLosFgF0YK/MAxYtLqDjY1uVgNPQYSmF4b67sXHj3cpI6bagRgVn0hbWEZIHOiS1r1VtQGwWiAwJebX337b5M7dII9zE0o1KT/Te3v8u2Tg4TwDddIecF5du9bwlHqSt7BZqOl+v9/fSTN5L95p7ehI2kFThCQv7SDydKQNhOFzEZ2//O53HQKlAwJTIsQyrWu9xYLyJY28k+KsF9G6E1m5Wu+nNdi8unp12/PUHVr9eUktzyKCUj88bHB4c4u9EpnG3aCiwG2ABecpt4HOn3//+y6BwgOBKTjipchgwhb6lymFOFaBeDidUOun4cbGfpLezYrDZqmEwyJR+e//bhXSsJiDeDjSBrzh8D7EprhAYArMb77/fo9zHC0qO+zVJC02o8Wa4s1kFjZ7ro76raRKn0yJSpNKDLfx9lDru6ucOALcgMAUlCi/4nnPqFr0eLDZ5xDKgyTCaJE3MxzucS9oUnok5rWIqKwdHm6xx3qj7KJyAjYw/vLb324RKBQQmILS/P77BudbXlBFkRCKDsO7IVEnrmX7+vr1HUX6DiVPwIn8KxcfPYoV4vnNv/1bI6zVpJiphPWqWoft+V+++aZJoFBAYArMr7/77liJ/gSQ8JPsWimDdyBPjNc3zEPyPkrWy8i6mdHmUp9QxoNgEiGUUW4mfJZUyCyJGWKRlyphvNV4K7IxWbSb5bgtzGN8/c1/faLkd7pUYXjzz7/7XZtAoYDAFJhf/cd/7HLnvkWWyGwtCsOuTBPVtVow5Me0sdFLKr8RhXJ++skP63WfB4ZogykO65y6wVRc4gqN7E9yZr2+G3MCQOyQ2P/89lvJD6UeBvvQDmTKsBgS/Ljveb0kch0fZrPJgs0E2kA9DM/+X+RgCgcEpsAsmYfpRetNwrCTh0VuE2tzmiyOn6cx8y2u0MQImQWcyL/smsgXYVGed0elMxvwHXsiHTEqZBrwqlbaj4Vn3AZoNJV6sceL/EthgcAUnF9///0zWUQ39XS0gFFEJe8L2CS/wANNtG5jqcHGgjhC88PVq82a5+1ZhMyevz/qb7mExKKp5vxdCQuLhLaeetwO+gnkqdLkg9FRq4mInNiCAeGx4gKBKThRArheb7NVKiGOzuAf/qFd5DIcv/ruuy0eFKOBJinvxlVols3LaFJ3Lzx8uEOWpJBjeWdm2e0XdWX8//r2W3/Ijo4YHCak1kNyv7hAYEBuGYuNjqojx2M86+y/LC3hUV5mXTyZmSEazrfcts23mPItuyqB46LR1O0HRRYVUF4gMCD3jK1aDqXdievViNAMw/CyrTczIy/TU56+Ylvu5df//u/bHApKolyN5NV2ICogz0BgQKGQsBInwlsJeDU7HHq5a/OGCZGxTuZHdeKU2osZDpPQ5/3B+vouqhGDIgCBAYUk8mo8byeO0Lh4MwdfX20eHg66Nsn8BLwWCAsoJBAYUGiSEBoaDm//5V//NdEClEJcryXaT2c4vF/0iRugukBgQCmIKzTRTLMzZ24nNZDHnHoMjwWUAggMKBUiNAPPa9OM9RSn4ToBYBoTErtH9kBYQKmAwIBS8ptvv205zjqT7X1v/uc33+yTA7/+7jsRlm2y53k9DFsohwLKBAQGlJZYYTPLvExUAqXffxatSLcjlqABkGcgMKD0mKnNew7ezFJTmSWZX/O8Zw75ln0Oh91EOAyUFQgMqAQxvJmFIuMoLr0wDG//F+prgZIDgQGVgnMkkh+xXZMyU2ScxEWpbn04vIJcC6gCEBhQOYw388wyZHZMZFzERWt9/z9/+1uXCQAAFBKPAKgY4j3UwvCyeBMWb9v51XfffQiv1Wu1J5ZhsdsQF1A14MGASvOb775rW+RleoMwvFT3PNlFdFmxwCwxUFkgMKDy2IoMLZ+/6anB4PKff/97G08JgNIAgQGArEVmGSAuoPIgBwMA019f37bMySwC4gIAQWAAiJDFjjJ9WCoYU0xkjQvEBQAIDAAfkNllOgxvUjzuYgElACOQgwFgil99//2u0voW2fP8L9980yQAQAQ8GACmGK6t7dBotpgNPamGTACAD0BgAJjCFJ88tcjlFPdR/gWA4yBEBsAcfv3ddz/SEmteZGLAn7/55iwBAI4BDwaAeYTh/aVep3WHAAAngMAAMIfBxsZSG46pMHxKAIATQGAAmEOUi1Gqc9rrtNYBAQBOAIEBYBHD4cJkf5R/waJKAGaCJD8Ap/Cr777b4jBYY/p5EZf+xsY+tjwGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgbFLgEAJzh//rwU97xl8x6t9dODg4N9AsBQJwAAmMLzvE0WjBbZ8Y5vEBjwAewHAwAAIBXgwWTMP/3TP/lKqQZbiH4YhvL4F3zzJ19jdkh8x8/3hsNh9/DwsBsEAfYcAQAUCghMyvi+v/nRRx9t8cMvWDDkfnP8NxaZme/h1314XKvV6OOPP6YLFy50WZCes/js//Wvf+1Qysjv3tjYaFi+LeDfFhAAABAEJjWMp7LNInKDJkQlBuL1RIlXTsAGfH/3zZs3bUqJf/zHf2ywmD2zeQ+//ibftQkAAAg5mMQRy//cuXNt9jzesiDILJwkxOUYElLj2x4LzVu+tQgAAHIIBCZBOIy1zeGst8ZrSZ0JodkTj4kAACBHQGASgsXlHt/JLXGP5TRYZFosas8gMgCAPAGBSQAWlz2+26YVIt4Mh+VemAVyAACwciAwMbl48eIdvmtRPthkoYEnAwDIBRCYGEiCXWu9Q/liU8JljUYj81AdAABMAoFxxHgJdyiHSLis3+/n8rcBAKoDBMYRznfcml6Bb4us1GcP6HkYhg/kXm7yHCXDNkJlAIBVgoWWDkj46ejoaGtyxf2yGAG5z6Ky//r16+6s10iiXhZp8sMv+OaTIxwqk89Y6eQDAEB1gQfjgBEXn+wJ6vX6pVevXu28efOmO+9F8jcWn9ba2tpl/m+HHOHfeAO5GADAqoAH48aW5esjz4XF5XK32w2WfY957eULFy60+d5l8WbkaRHKt5SaTz/9tMHGiJT2Ec/3FzSaTRgZFuPCqXzflRtqxYEsgcA4wJ33C8u3EIfE7tuIyyTizbDIfM4PXda4yG9tz/uj5Gk4n3Si5hgPRmQLn5d7/DuXnVxwn49rd9EL+LPkd/m0JPybO+z93aSEmXeOTuHU44sD/6amlCLic94ks7h3Vsh2/Nz4XoqmSsFUyftlKTYc9t3n3/C55dtoOBzeTLu468WLF5t8TvYs30Ys6pe4T6PK+QIgMJZIyKnf71uHndbX19sUA+6ct22LTxqaS7zGp2TYpCUrGfCxLPO6s3z7hJbnLKWHb/PiJY/P7geMKnPfMvk5188XL6fBgrnDg36bheZuFkLDYijC9iVZwu8TD7xDKcIiJpUwfLKjDXE5HeRgLBkMBi5eRM/VexnDeZuOfA5ZEnemG8gH586d22JxecHXc4cSKkckJYakKGsWtew4PCzenEv7TTWPKJ/N4mItfCxKDwicCgQmA9hye0kJINOYyQFMVy4u4rWwADzhQfBJWsbCuJadiBilhFj73H5dBuXNw8PD1MofmRylrYAFWezJVAYQIrNEkqe2+QmTeI0Nh9la3NmsrTkkdouJGAYy8GfhhZrK3E9YzGSG411KAT6Wfe47tyzfJmvOJK/XoRQQD4ks4WNI5fyUEQiMJdy4XOKuPiWAifki7lsBshSXSSQExyIjD5285UVImPfChQsdWi4vOElTQllJ5zyMZ98kOwI29PYJLAVCZNmwKbN+CIAlWJW4jBGRYUMqrT2NnpID79+/b1HCcF6oRfZ0kNxfHgiMJZzkD8gB4+YDsBDJuaxSXCZoUQqsra21ycELd0nEn0YYhtYiyr8f4TELIDCWmHyGiwXTNPvGADCXjz/++E6ZZ/7FSPY3k4wCyNoX2/Msk2zizgatGhAYN7rkRovj228xqwvMQrZ/oGrUjmuTA+zFNCkhZO0L2dMmYAWS/G5IHLlJDpidJ99muchtERsbG72jo6NZq99lQZ7tjJ/2slOpOVHqKtJlJpEwqpQl4rYllbk7k5NSzAzIpllR79OKkFp7Lsl+0x53KCZmsbRtyC3g390mYAUExgGJI5v9VpwXgJlFbuLRyIyUp6tqvCZh2Z5+3pTPsBIYERd0QjfEe4kbGjNbPuyeOXNmUSI6Kl8j15dFaMel7FES8PfeFbEjO6LJMnHXoJhitVZ9F1OT3UCIzAHpvNxA71MC8OdIY99ji+5HWVAnA40keglUDWfvxWwBcZvFvXlwcLC/zCwnmTIsr+eBU7zXgDLGtTIFh8liz25zWfvCHneHgDUQGEdM6YuAkmNzLDac6P1RCj2K2CBfU35iei+yBcRl18Ka4nGabSEyD1m6GGnSR+KUjnFc+9JGct8NCIwjZjbMFUoPiZXvSb6GxeYF37BDZXlxKtEinouIA7fFWOIgg+cqRMYYabZsxlkT47L2hft5ItGKKgKBiYEkK02IIW2kFtM9IzbPEEYrD2KNs1A4rfHgHMrtpCxrMZhYZMRgymwRoQnldciSOGtiHNa+dBdtDggWA4GJiYQYuMFn2TGbJoyWSRVckC7D4bBJbrSTnlAhYsUG023KEEn2kz1NlzCZ49oXeC8xgMAkwA8//LAvmw9RtsnSzSzLrYN0cBWYtFaUG9HqUEa4JvuPjo6s1ws5rH3B1OSYQGASQqw/TrSedbTIYjEut24W6oEC4bLLI6WcdOa2lKnV7jgj0yrU5bjvS4dALCAwCcMW2Q5bl7KzopTDCCgjTLn1PRYZ1DwrFtZ7naS92RV7xR3KMBfjshmZtHeb0jEu+76g7lh8IDApYLyZlng0MgnAdaMwF0y5dYhMATB5BNtcQi/tza5M8j2zxLb5Pusqy2Y75aVwWPuCqckJAIFJGYnhyoI28WqyEhuITDFgq9onS5LaHXWJ78nMKBK4zbbJkmW3U3ZZ+4ItkZMBApMRYg3NEJunZhV24ojIpLkFLogPW+AuU83fUjYElCEm2d8hO2RNTPO0FzmsfcGWyAkBgVkBE2KzxR3rlywGssgt8ZwND2B7cVY9g1zyjjKA205A2eMSJju1Xp7t2hfUHUsOCEwOEOttnLNJWGw2XaZzgmzggc8n8AHHzcgWrolxWPvSQ92x5IDA5IxJsUmiEKFDyX0AVoLrZmSLjCiHtS/7SO4nBwQmx0gYLYG1NZtJ7gQIksMxDFXqkCefk32yZN6WAy5rXzA1OVkgMAVA1tawZSeVApwmBHAHtF5rAXKLTxlgu19KUjgm+2dup2y79gVbIicPBKYgSME9tsacCms6rhYHBsfZXqcyGAwCsieTa8mhpZUZJS6VBGatiXFZ+0IgUSAwBUJqnpFD+YqqeDB8nL+gFEhLYFy2y5aEdRYzA9WKdroUXCoJTIuJw9oX1B1LAQhMwXBJgvJ7qjJV2acUSDlcZD3tOM5+KMtgBKxJK8Jxx9hjuUbbtS9hGKJqcgrUCVhhLCOfLElq4RZ3hA5beFQRfuTbJxavl0HGd/EMFiEVj3nAozRg8e/yZ9sc43g/lF1KCbNnPa0SqU/W7/etqlFwv5DXd+SxrH2xOYYzZ85YTy4ApwOBsYQ7t2xva12Gha3CXy6zVzr4GR5839mG9/j6NCnhWHqa4SL+7A7f2Vb5jZLaKa42X3mZIekrFy5c6JCdJ9UQ74tzWw1uO77F+1B3LCUQIrMnIAcODw8TyYO45APSKkeTAQFZ4pDYXYjxWFPLYfHvdSoqaaz1xJEtH2w35UoLh+n50XbKtmtfUHcsPSAwlnDHdhqsjWWdBNaDnXgCVEB4gAnInmaS636kphuliOuGW0yTLfx7lCAipny8iX5mHFzODfezG5ZrX7qoO5YeEBhLzAwXa2RFfUKzf1wKWFpbyRzDdhn0fEqQVVv3IlQyYFHKuEzcMGyzyCTy+0RcZNM6ytlCTodkvxhgNmtfkNxPEQiMJSaP4uIRxK4LJgMedzjbeH00MYAscRGYpHMVq7TuzYC7Rxngsnp9gnbcrRnG4pKX0NgkLpuRWYCpySkDgXHAZe8K8747rhZnjAHPqfT4xsaGS6dumJxFkjh5MTSy7p1EhgfsRpYDruPq9Q+Y/X/2XM69bOnAHt+LPIqLYAy6tPam6RBIFQiMGx1yx9rijDkIdMgBR09Naj89k0QxJUTM/eG3+be8Xfb3+L6/KdeGz3PmA27MenPy/pY596cKjTnOFgvwM37PE8p5fTM+tlSmZKPuWPqsdrJ7gZHOSTEWo3HsN+C7Noeins/yMD799NPG+vp6k0ZTWJvkiGxu5joFkwehfZeQ3AQBzZkJJnmHZcITkrfq9/uyyVasQdCc7w4fz8vhcPjBK+IB1ue/icciJVialBCypwgf347Ne+K2qSm6ssaG72Wqt1Qp3pSbOU6rPMWyuBzzsiR8buS3PpX9mAikCtbBOMIN9LZYuuSIsZB3ZNEkdx55qmduLvu0zyPW/H7HNRqT+DQ/8b9U2EM8qYsXL97n8x0rz2DOd0seTy9UXfWiwjFsDNxkMZU2lcT1b0yuIZJjzMtxOiKbkTUpIdiwS8UrAsdBiMwRKT4ZN6wxhQwqPiUnLkHcEIDZAGrlmERvQCXHGAMI28zAcTOyeWBL5IyAwMRAyuhTThOFbKHdjrs62eRhOrRiTG0qp0rSReP169e7DlNzE8eEFHOD62Zks8CWyNkBgYkJW1ZXKGfWtXSgg4ODOFNfJz/rNuUAmWmVsMe4NFlXQuBjlensHVodAeXQk4o5nfsD2BI5OyAwMRHLikXmMrlPp02UpBOtEgrku7yIzA7fZV3WI+DbFcoYY7hk3qZETKU9O+62mSpxp3MbUHcsQyAwCSANVjplDkIbt9OYxSNhG8p+YJ8J/5YWZfdbouvquDFYLMRw4WO9lGWbEnHhfNflPA/AMaetY2pyxkBgEkIGBAltsAchuYKAskUGwktGCFJBBvY85AYE81vSHii6Ii6rHmylTWUUGgxYXC7x8ebCE5+Hy2ZkY7AlcvZAYBJG1nYYb0YGhYBSRCxO+R4ecM9mMTCsUEBPIOEyPvbLSf+WiXN6KS+DkRyrrGei0VTdxJF6XGKgFGHwddyMbEybQKZAYFJAOqoZFC6bAfklJUs0RZotzrMmL5EZIqAiaHJcYhHSCpGY/Pi3UEyhMYn8tljxWZ/TZZA2xccqG4FdTuq8y+fI5/E13S7SXkVhGLok+1F3bAVgoWWKGIuwLbdGo+EfHR01+fGWWfT3+bKfI4Mfd6qXfC8r67sm2blSTGeV49qUHR/5Fm3yZFFiJaCEGP+WixcvNvk8yflt0hLnd/K8srC0Fw2yDoN6QClgrn3TtKftZY91jBwH5zE6srZo0fGaYqe5OOZp+Bi2bReNJjXFGdiBUjErxBRV3OTO7E//Tfad4UE7kI6e9BbAVWHe+ZVz2+/3u2U5rxO7ODZMSRh//Dezp04gs8JYVLpl2FVV6stZGDIRcUomAXcgMACAwmB23LStKi5h3Uos1M0byMEAAIqEdU06bIm8OiAwAIBCIDk229AYoe7YSoHAAAAKAefSrHeERd2x1YIcDAAg98gmarVa7a3l22Rq91kCKwMeDAAg98i20GRPh8BKgcAAAHKNeC+e51lvfIe6Y6sHAgMAyDUsLk2y3IgPdcfyAQQGAJB3rKcms8BgS+QcAIEBAOQWs7DSJzuCpDbcA/GAwAAAcguLyw2yBFOT8wMEBgCQSyS5z3dNsgRbIucHCAwAIJc4Tk3Glsg5AgIDAMgdZmqydXgMU5PzBQQGAJA7arXaFlmCqcn5AwIDAMgdLBa3yJ42gVwBgQEA5ArXqcnYEjl/QGAAALmCxcXFe8G6lxwCgQEA5AbZ84XvGmQJJ/fvE8gdEBgAQG4YDoctsgdTk3MKBAYAkAtcpyZjS+T8AoEBAOQCx4WV2BI5x9QJgAw5f/68xNetkrhhGD7AIFJ+WGB2+da2eU+9Xg+mn+M8zh1uMz4tidb65cHBgVX15Sy+owxAYECmcAhkkztby/I9zwmUnjdv3nQpAbh9NVmomhZvkfZlNfhn8R1lACEyAAAAqQCBAQAAkAr1CxcuvCU77r9+/Tp1V8/2d7HL+pRd7G0CAACQCyQH49u8gQdyq72xY+CTHb8gAAAAuQEhMgAAAKkAgQEAAJAKEBgAAACpAIEBAACQChAYAAAAqQCBAQAAkAoQGAAAAKkAgQEAAJAKEBgAAACpAIEBAACQCijXnwKffvppY21tTfY98fn2ydSf32mtu3zrpb3Hie/7mxsbG41ardaQvSuUUh/K6fD3/53/35PfMhgMgr/97W+JlEpfNWZXxCb9fO43+Tij8kZ8rIEcN/89GA6H3cPDw24QBD0qMLOucdr758g55u9p8Hn0J9rVifNcxvZVBGz6QNpjUGUF5uLFi00+0Xs27+HXX5m3ZwVf1KZs98oXcov/u7BeG78mur9w4YLcdfhzH/z000/7SQx2MuB8/PHHLX74Jd+a4+f5t838DXK/vr4uG4EF5rc8PTg42KcCIedezrvZbnfuuZdjHR83D8jE50muQaLnfxafffbZFg/E92zew53/Mnf+YNbfTrvGSe+fMxaxWe17ul0Jk+e5DO2rCLj2ARmD+JrI9ZBiwe1F3+FQgLhTdQ/Gt3kxDxInLpxcWL5Qd2iio1sSbVzEA8Y97oT7/B135w0si5BB4KOPPrrFnyUVpa0LkvL7fL5r8X3LDAZ3T2twqyaBcy9E55/P3R3uQPs8sN93Of+L4M/cNOc3Nvwb5frKMadedDZum5pkun3xfSrnumrwuZRzKjvENsgRYzRs8WdJu1rU732y4yxyMI6IG8qd/RkPcM8o3gA3RgahFlsgz8yFXhoZdFig3po9zWMPPDIY8G2Pf8dbGcQpZ8jAx8d8L8FzPx4At835b1HOkPbGv+sFPxRPKFVxkfMrbTDJNjXJ+Fzz9Xsr39NoNLKq0F4apF9Ke5B+SjHEZZKpfu9TAkBgHDCWs3T2JiWMucg7PIC+OO0ij0WOUhp05LfIIG4reGnCv6XBVrWc+1T2/hl3MjmvSXWyuIzbm+Q9KGXku+T8piEss5DvOTo6epFHQyavcHj/jvTLtNqD6fdvk+j3EBhLeOC5YSzntDufxLznDnImkZeYBb8II3hWOYQ0MHHmZ0mFm06huej8Z0WG7Y3GXmFG5/cDeTRk8ojx3J9xbmOHMiCJfg+BscBYDG3KCOl4swa5sbhkPBBsc2OzmhSRJOK5ZDXQjjED3wv5bloB5nvblAHm2q50R9i8GDJ5xOTDMjEop4jV7yEwFvCgnnnjH4vMOE69InEZ01qRlenz7QmtBsmNrcKT8SmjYzYDSIvywUoNmbwi4pJFiHQOzv0eAlMAREz6/f4d83hnReIy/i07WcfL+TvvrPKYmc1Jkc8CmR2XxTEbj6FF+aKFcNnPyDVaobhEmJycNRCY4rDNnW7PzHNfKfwb9qo280cGe05GZ2lZNyllzJTnlYbF5iED2rlz57ao4pgZjbm8RssAgSkQMo2ZcoAZbAvb6F2R9QJlGfRMyC+JkK9Upngq1QPkJo/59lxW8VNMqmjITGKuUaE9OZSKSY533ME63CmiMjDjJ02JBnFvvyD7hUquvJRVtHzfnXrep9HstC/473EXzt3izr/b7XZTWf1uiwxow+Hw6fT5pwSP2XzPPT7uTl6O25U4+UQjHvfr9frC62+qZbT4oavXvWlCw7epgiQZDhfRp9F40J34/E1+XqblN/m/n1MKQGBiIheOO+vOq1evOqe9dqI8jU/p0ObPvz+vnM0kZgXwnRi/ZfP9+/dNvt+nFWJz/hM45knvbYcKijkPTp6YtK+1tbWdZQTWXJMOC/IOC4W0+ybZs82W/NO0a2blDTOZJ1Y4fFlDQOBrJHneHXI3BmYCgXHEFPKTsgq7y77HdLizLDQ7/N4kXd+Af8/NZQbZMVIOQixxHizvuQ423AGkRMVKBMbl/JsSGG0zwDovTs2J9/ahaKoZSCZ/y2kGhnXbk+9gD/22S/kgPk8B3112bfemHFCHKoRrUn2MjSEgmGvUMsaATIf2KQEgMI6wVXCZL8qpnsIsWAh2TD2mJJLGATeky6aBWGHec4WTvW1ys1waEiNfwUAbmPMfkANjcY3RkcR7a/H90uKWBCa3sc/Xu+16zo0X7ZMlruIyibR7/n5yEJnmitrZSkjAe7ltY3hNYvpUYkYwkvxu3HYVlzHSWXmwuE8x4cHmiutAO+b169ctOt3qncXm4eFhg7LFWVAnkffL58jnkQM8AHxJ2SHGyGVuM02+VrE8J85TtcgS4ym2KQFEZEz1XiuqNKnElNp35ba0EYqJXKckxicIjD3dJC6gwFb4Dh0PbdjSjit0Y7gxOSVSs56fn4S4jJHPkdAiudHMaIZTJIQ24c9FOAhjwOKyQwmyvr4ubc223a98en5WcJt0OlYxBJIamwRucyLqHYoBBMYSiW1SQoglGsdK4IHnLiXEOCFLlmS5AFI6UFLiMkaO2/UamDBZqiQpqBIeI8u8k5xzShhzPE9t3iPtLC/FR9PEGC1NsidxQ0Dg9icGmLMRDIGxo5f0Hikyw4MckHh80oOtbLxF9viUDal0IMHVk+RBL5WpnRPsJnmNOY9iPZmDvY0OpQB7UtZhspiho0IwGAycIgJpGAKC8fKdjWAIjAVmLnmimHj6O7KnQwkj63jInizCRKl1ICGGJ9mkFGHrMTFvWbAVxDSMmDH9ft8ltJt1vi9zuA82yZ4gzc0BXY1gAQJjRyL5jhl0yBKZokoJY3YXtLXkP6EMSMuSnqBDlkjYJq08TEqDu+0AnVZ7J8edLH0qP9YiKtUTKEWMEdwhBzBN2Y6AUoAbSDDeJ9viPWlN2Qwof5ZiNy1LeozkYi5cuCCepJVgHh0d+ZTOQJzoZ4oQstdgK4Zf8jlJOwxoQ55+SyrwOGBtsLHXYx1udEBErEmWQGAsSHFQdyGgdMjdWgM+7y4hRBc6ZDlbyawpSVxgTKmfxHCJ7ZsJHD7lhCwnlKwQnyzZ2NhIzdMcI+3R1ggWECKzIGcCUyVS70CCeJJkiak1lzhoa5XFdpZfkMUCVA5RB+QABAYUgYAyIIkKwEnheV6iv4XDKD6BMpKJd+8qYhAYAAyOXoNPKcCCAA8GFB4IDAAxQCgLgPm4CEwm01IBWAE+WZKnsBqoJLkej3PpwTiWhPg7gbLiUzZYJ+yL4sHUarUyCGEmkz1WjNV1SmuSyTSu671kmrLt3P9fUsrU63WfOy5ZAkuyvGRipbmUfimKwAyHw8BhmmmQ4RTxZaiCwIihbDOYb4pB7rhwdWlcS9iIwPxIdh049cVOZitPq/cgFl5qmpQNLp0ooAIg00z7/b7Ve8IwvH9wcLBLIEvekqVBZWq0tSlFeHx1EhjP1kJJszzGGLa2mmRJGqVTQD7IopLuZ599tkUOIbK0LcekMNNMbcMvpV85n0NcPMYvKH2c9j+SHExAlhwdHW1RulgfzMbGRkCgtLCV1qIU4RCAdZtOo/hpylgZYVnv9QMirA1l2fI8TaPfGHdNckAExuWAUtv8R/ascCgJEaRdqwqsFm4Tt9LqRDG2qC2U18zn0FYQG1XYgyVPOJYI2kxzx09uNzvkiMex2X2yp8kNr0kp4LIPNL/nJYGyI8UaY+8RPotarfaEHMioyGCSdMiStD1HcJw3b96I0eKyN9GtNIyBGMZXRF1isxcuXOiQpQvEX7rHFuWlJOvg8O/YJjdXrGgdHbixzQ3+Kec9OpQQ7DHfcUxg9pL8HVlgKkZLf13aEzSe427C/fwF2dfcesqDb2pWes6QysW2g/omG0p7fH+ZEoTH+WcUg2gdjIPrHCVe2aK8Rwlx/vx56eROFqqjFwYKiHgbSVlqPNDd4IFrh9woZJtz2LVUwi97lBAi6DSaredb3ioziYfH1ja50eQ2ndi1ks+KW8E6EpgYO5a1WBhid/hz585t8YGIUrrE2NtZVBMFuWFTrKq4bU7EhWJM7RwOhy7bS68cl62KJYnM/Tx2eFKMSEdBT3XHxrwhnia5r+trcduOZfj7vr9phKpFMYkEJs6OZdL4pMNz42mRJdLgRKD4/RIDd0rgrq2tpbaVLsgnYlWxJ/OWDRPrkInpPNIB2+ROt2jhsTFm8OqQJZLojSMy0teNEelChyqG4xbeY7b5fL91McIkt/7RRx/JdWpRAnzYcIwP6C5bF01ywLhRe6YBdiReOhgMgr/97W/H3FpzwDI4iIssU5GbFI82Zo9VFzZM7nGbu8UP7/7000/7QRDMtfpEWLjj3OK2KqIUazYat+84nX/luPZ1IzJbYRhesVn/Y3KrMja4nPegikakRJU4BSFt26mtjo0wvl5tvl4PTjOIRFj49XKNmpQgHwRGLBuOj97nhneLHDFC0+L7FudFpGFRilSy4YHjjI2bjz/+eE8mq3BnemkKUAY0it1/YtZzJLKmQ9a+FD1cE6evy7k0A5eE2p7OE/ZPP/20wf3zy7iCLjmjKhqRZvKVjG+xwl0yFvP1klRGQKM81rh/RHsEyRbNfGtSTKNrHse2TGbV3GHVFM/Cp5zDDe8uvBcwRdOUzUgNNpxaVALi9nUJjfPdlhH2saALmxO3uEjuZYcqyuvXr3dNrjC2cTSx/fXW+DnuK5Q2x75BVJN/yE3KORKiqFLSD+SDMhk1Cfd1EZOxl+hTAuIiVjZ7QIlOuS0ifA6uUIEL+Z6QMJMEvE35pVuh+fAgJ/CAt182azrPfX04HN5EhCIyBAK+W3kqwHXfo5k+krhmkgik/NGFVVM9xHOg1VpxAYeUcu/Zu5DHvi7X++DgAGvbDHm4RpyvcTJE5gbh2LrZyVnDeyDigjUvlUT2JRHDYhXXPih7u8tZX79d5bzLPFZ5jUTwXVMSC7M8clCcCJIYYECr5TareAviUl2kRlPWIiMzxlhcLlUhVDPR11fSxyQEw7fLYq0TmMkqRMaIyw45cuo0gh9++GHfhKUyX7k87uBodEAQkZH2QBkYPGYiSbNKRo3p63J+O5Qh0s85BHnJ5ITAArIy+seCH9ebXGqemlhw4kFwQ7iUxR4Y8h3m4KSDdwkAg7RFGQRjrnSey0Tbq+REEtPXL/N5kJxTQCliEse3TT8PCCxF2kZ/koJvNRFaLEhpDHxwZ2l0cAElhDQ2WXE6FhZYM2Ae4lVw+9ieaIexkU4lgyra3giJubPQnDVCk/R2GGI03uZB7CyiE26Mjf6k+8CEYR9QAtTJAfPlLXksG4SxMMjinQa7bp/zj1xqDrwIimzXLBvsSAE+bmxd7tiZhSP4N8t3WXlj/DvT+n2BrWe4sbGRym8xe+soi9cHZIHLeef3BLOeH7fDRqOxIxsumRXJNtv8Svvbl/bHnbVDKVGr1XrD4TAX19cWk9xt8zmW6ulbfL6kMK3LFr0vx309bQG3bcPkUKk5i+9Y6kMn+oDj9Vm6DzhEr7o2J2gppN4Yi4WUINjkTnVCbPhAAqlTVpS9zEGxkF0vuX1J1d6GMXY2x0YPt8lADBtpg9wZu2iD7kjxShZOX8qNyPnlmz/+m5xn81Duu+vr6wEm6GTHdB+YvjbjPsDXr5P2dfn/P/VFiJ+JskoAAAAASUVORK5CYII=";

/* ----------------------------- helpers ----------------------------- */

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return localDateStr(d);
}

function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", weekday: "short" });
}

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  const today = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return today ? time : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) + ", " + time;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function shiftWeek(weekStart, delta) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 7 * delta);
  return d;
}

function fmtWeekRange(d1, d2) {
  return d1.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) + " – " + d2.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const TOPIC_STATUS_ORDER = ["todo", "in_progress", "done"];
function nextTopicStatus(cur) {
  const idx = TOPIC_STATUS_ORDER.indexOf(cur);
  return TOPIC_STATUS_ORDER[(idx + 1) % TOPIC_STATUS_ORDER.length];
}

function topicSetProgress(arr) {
  if (!arr || arr.length === 0) return null;
  const sum = arr.reduce((acc, t) => acc + (t.status === "done" ? 1 : t.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((sum / arr.length) * 100);
}

function progressOf(student) {
  const all = [...(student.grammarTopics || []), ...(student.vocabTopics || []), ...(student.examTopics || [])];
  if (all.length === 0) return 0;
  const sum = all.reduce((acc, t) => acc + (t.status === "done" ? 1 : t.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((sum / all.length) * 100);
}

const STATUS_LABELS = {
  active: "Активный",
  trial: "Пробный урок",
  paused: "На паузе",
  finished: "Завершил обучение",
};

const TYPE_LABELS = { trial: "Пробный урок", regular: "Обычный урок" };

const SLOT_STATUS_LABELS = {
  available: "Свободный слот",
  booked: "Занято",
  "reschedule-requested": "Запрошен перенос",
  cancelled: "Отменено",
};

const DEPARTMENTS = {
  language: "Языковое подразделение",
  humanities: "Гуманитарное подразделение",
};

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

/* --------------------------- subjects config -------------------------- */

const SUBJECTS = {
  english: { label: "Английский", emoji: "🇬🇧", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  spanish: { label: "Испанский", emoji: "🇪🇸", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  chinese: { label: "Китайский", emoji: "🇨🇳", dept: "language", levels: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  korean: { label: "Корейский", emoji: "🇰🇷", dept: "language", levels: ["TOPIK 1", "TOPIK 2", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  history: { label: "История", emoji: "🏛️", dept: "humanities", levels: ["Базовый", "Средний", "Продвинутый"], grammarLabel: "Темы курса", vocabLabel: "Ключевые понятия" },
  social: { label: "Обществознание", emoji: "⚖️", dept: "humanities", levels: ["Базовый", "Средний", "Продвинутый"], grammarLabel: "Темы курса", vocabLabel: "Ключевые понятия" },
  russian: { label: "Русский язык", emoji: "📖", dept: "humanities", levels: ["Базовый", "Средний", "Продвинутый"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
};

const SUBJECT_ACCENTS = {
  english: "#8B6FB3", spanish: "#C9922E", chinese: "#E0685C", korean: "#6FA8C7",
  history: "#C1673F", social: "#B23A3A", russian: "#9C3F5C",
};

const SUBJECT_ORDER = {
  language: ["english", "spanish", "chinese", "korean"],
  humanities: ["history", "social", "russian"],
};

const ENGLISH_VOCAB = ["Family & Relationships", "Food & Dining", "Travel & Transport", "Work & Career", "Technology & Gadgets", "Health & Body", "Weather & Nature", "Shopping & Services", "Education & Learning", "Sports & Hobbies", "Emotions & Feelings", "Housing & Home", "Money & Finance", "Environment", "Media & Entertainment", "Daily Routine"];
const SPANISH_VOCAB = ["Familia y relaciones", "Comida y restaurantes", "Viajes y transporte", "Trabajo y carrera", "Tecnología", "Salud y cuerpo", "Clima y naturaleza", "Compras y servicios", "Educación", "Deportes y aficiones", "Emociones y sentimientos", "Vivienda y hogar", "Dinero y finanzas", "Medio ambiente", "Medios de comunicación", "Rutina diaria"];
const CJK_VOCAB = ["Семья и отношения", "Еда и рестораны", "Путешествия и транспорт", "Работа и карьера", "Технологии", "Здоровье и тело", "Погода и природа", "Покупки и услуги", "Образование", "Спорт и хобби", "Эмоции и чувства", "Жильё и дом", "Деньги и финансы", "Повседневный распорядок"];

const VOCAB_BANK = {
  english: ENGLISH_VOCAB, spanish: SPANISH_VOCAB, chinese: CJK_VOCAB, korean: CJK_VOCAB,
  history: ["Даты и события", "Исторические личности", "Термины и понятия", "Причинно-следственные связи", "Работа с картами", "Работа с источниками", "Историография", "Периодизация"],
  social: ["Термины и определения", "Учёные и теории", "Нормативные документы", "Практические кейсы", "Аргументация для эссе", "Обществоведческие понятия ЕГЭ"],
  russian: ["Фразеологизмы", "Термины лингвистики", "Стилистические средства", "Изобразительно-выразительные средства", "Орфоэпические нормы", "Лексические нормы"],
};

const GRAMMAR_BANK = {
  english: {
    A1: ["Verb to be", "Present Simple", "Articles a/an/the", "Possessive pronouns", "Plural nouns"],
    A2: ["Past Simple", "Present Continuous", "Comparatives and superlatives", "Modal verbs: can/must/should", "Prepositions of place and time"],
    B1: ["Present Perfect", "Past Continuous", "Conditionals 0–1", "Passive Voice (basic)", "Reported Speech (simple)"],
    B2: ["Conditionals 2–3", "Gerunds and Infinitives", "Past modal verbs", "Passive Voice (advanced)", "Inversion (basic)"],
    C1: ["Mixed conditionals", "Advanced Reported Speech", "Cleft sentences", "Participle clauses"],
    C2: ["Stylistic inversion", "Idiomatic grammar structures", "Subtle modality", "Literary grammar devices"],
  },
  spanish: {
    A1: ["Ser vs Estar", "Presente de indicativo", "Artículos el/la/los/las", "Adjetivos posesivos", "Plural de sustantivos"],
    A2: ["Pretérito indefinido", "Pretérito imperfecto", "Comparativos y superlativos", "Verbos reflexivos", "Preposiciones por / para"],
    B1: ["Subjuntivo presente (introducción)", "Pretérito perfecto", "Condicionales reales", "Voz pasiva con se"],
    B2: ["Subjuntivo imperfecto", "Condicionales irreales", "Estilo indirecto", "Gerundio"],
    C1: ["Casos complejos de subjuntivo", "Inversión y énfasis", "Tiempos literarios"],
    C2: ["Construcciones estilísticas", "Formas gramaticales arcaicas"],
  },
  chinese: {
    HSK1: ["Глагол-связка 是", "Порядок слов SVO", "Базовые счётные слова", "Отрицание 不 / 没"],
    HSK2: ["Аспектная частица 了", "Сравнение с 比", "Модальные глаголы 能/可以/会", "Конструкция 从…到…"],
    HSK3: ["Конструкция 把", "Длительность действия 着", "Условные 如果…就…", "Результативные морфемы"],
    HSK4: ["Пассив 被", "Расширенные сравнения", "Союз 不但…而且…"],
    HSK5: ["Продвинутые результативные конструкции", "Эмфатическая конструкция 是…的", "Письменные обороты"],
    HSK6: ["Классические письменные обороты", "成语 в грамматике", "Тонкая модальность"],
  },
  korean: {
    "TOPIK 1": ["Частицы 은/는, 이/가", "Настоящее время -아요/어요", "Отрицание 안 / 못"],
    "TOPIK 2": ["Прошедшее время -았/었어요", "Соединения -고 / -아서", "Базовые уровни вежливости"],
    "TOPIK 3": ["Условное -(으)면", "Простая косвенная речь", "Модальное -(으)ㄹ 수 있다"],
    "TOPIK 4": ["Пассив и каузатив", "Уступительное -아도/어도", "Именные окончания -기 / -음"],
    "TOPIK 5": ["Продвинутые связки", "Формальный официальный стиль", "Литературные конструкции"],
    "TOPIK 6": ["Тонкая модальность", "Идиоматические обороты", "Публицистический стиль"],
  },
  history: {
    Базовый: ["Древний мир", "Средние века", "Великие географические открытия", "История России до XVII века"],
    Средний: ["Новое время", "Революции XVIII–XIX вв.", "История России XVIII–XIX вв.", "Мировые войны"],
    Продвинутый: ["Новейшая история", "Историография и источниковедение", "История России XX–XXI вв.", "Историческая аналитика и эссе"],
  },
  social: {
    Базовый: ["Человек и общество", "Семья", "Экономика: основные понятия", "Право: основы"],
    Средний: ["Политическая система", "Гражданское общество", "Рыночная экономика", "Социальные институты"],
    Продвинутый: ["Международные отношения", "Экономическая теория", "Конституционное право", "Подготовка к ЕГЭ: эссе"],
  },
  russian: {
    Базовый: ["Части речи", "Орфограммы корня", "Простое предложение", "Пунктуация при однородных членах"],
    Средний: ["Сложное предложение", "Причастный и деепричастный обороты", "Прямая и косвенная речь", "Стили речи"],
    Продвинутый: ["Синтаксис сложных конструкций", "Пунктуация в СПП", "Анализ текста", "Подготовка к сочинению"],
  },
};

function firstLevel(subject) {
  return SUBJECTS[subject].levels[0];
}

/* ---- normalization: fills in any fields missing from older saved data.
   This is the permanent fix for data loss on schema changes — we NEVER
   bump storage-key versions again; old data is loaded and gap-filled instead. ---- */

function normalizeTeacher(t) {
  return {
    photo: "", bio: "", available: true, availableSpots: null, payoutOverrides: {}, staffMessages: [],
    ...t,
    pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [], ...(t.pageTheme || {}) },
  };
}

function normalizeStudent(s) {
  const base = {
    contact: "", startNote: "", planType: "individual", status: "trial",
    grammarTopics: [], vocabTopics: [], materials: [], homework: [], messages: [], supportMessages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [],
    examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [],
    canRequestTeacherChange: false, teacherChangeRequest: null,
    ...s,
    pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [], ...(s.pageTheme || {}) },
  };
  base.messages = (base.messages || []).map((m) => ({ attachment: null, reactions: {}, ...m }));
  base.supportMessages = (base.supportMessages || []).map((m) => ({ attachment: null, reactions: {}, ...m }));
  base.homework = (base.homework || []).map((h) => ({ materialAttachment: null, submissionAttachment: null, ...h }));
  return base;
}

function normalizeSlot(sl) {
  return {
    requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "",
    paymentRequest: null, trialName: "", slotPaymentLink: "", reminderSent: false,
    ...sl,
  };
}

function normalizeProduct(p) {
  return { lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0, subject: null, ...p };
}

function normalizeExpense(e) {
  return { category: "Прочее", note: "", ...e };
}

async function loadStrict(currentKey) {
  try {
    const r = await window.storage.get(currentKey, true);
    return { value: JSON.parse(r.value), needsSave: false };
  } catch (e) {
    return { value: null, needsSave: true };
  }
}

function genTimeOptions() {
  const out = [];
  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
    }
  }
  return out;
}
const TIME_OPTIONS = genTimeOptions();

const HOMEWORK_STATUS_LABELS = {
  assigned: "Не выполнено",
  submitted: "В процессе",
  in_review: "В процессе",
  needs_revision: "Не выполнено",
  reviewed: "Проверено",
};

const HOMEWORK_STATUS_TONE = {
  assigned: "danger",
  submitted: "gold",
  in_review: "gold",
  needs_revision: "danger",
  reviewed: "green",
};

const PLAN_LABELS = { individual: "Индивидуальный план", package: "Пакет занятий" };

const EXAM_OPTIONS = {
  english: ["IELTS", "TOEFL", "CAE", "ОГЭ", "ЕГЭ"],
  spanish: ["DELE", "SIELE", "ОГЭ", "ЕГЭ"],
  chinese: ["HSK", "ЕГЭ"],
  korean: ["TOPIK"],
  history: ["ОГЭ", "ЕГЭ"],
  social: ["ОГЭ", "ЕГЭ"],
  russian: ["ОГЭ", "ЕГЭ"],
};

const EXAM_TASK_BANK = {
  IELTS: ["Reading: True/False/Not Given", "Writing Task 1 (график/диаграмма)", "Writing Task 2 (эссе)", "Speaking Part 2 (монолог)", "Listening: Multiple choice"],
  TOEFL: ["Reading: Vocabulary in context", "Integrated Writing", "Independent Writing", "Speaking: Independent task", "Listening: Lectures"],
  CAE: ["Reading Use of English Parts 5–8", "Writing: Essay", "Writing: Report/Review", "Speaking Part 3 (дискуссия)"],
  DELE: ["Comprensión de lectura", "Comprensión auditiva", "Expresión e interacción escritas", "Expresión e interacción orales"],
  SIELE: ["Comprensión de lectura", "Comprensión auditiva", "Producción escrita", "Producción oral"],
  HSK: ["听力 (аудирование)", "阅读 (чтение)", "书写 (письмо, HSK 4+)", "口语 HSKK (говорение, отдельный экзамен)"],
  TOPIK: ["듣기 (аудирование)", "읽기 (чтение)", "쓰기 (письмо, TOPIK II)", "말하기 (устный, отдельный формат)"],
  "ОГЭ": ["Аудирование", "Чтение", "Грамматика и лексика", "Письмо: личное письмо", "Говорение: описание фото"],
  "ЕГЭ": ["Аудирование", "Чтение", "Грамматика и лексика", "Письмо: эссе", "Говорение: монолог и диалог"],
};

const EXAM_GRAMMAR_BANK = {
  IELTS: ["Mixed conditionals", "Passive Voice in academic writing", "Tense agreement", "Relative clauses", "Modal verbs for academic writing"],
  TOEFL: ["Complex sentences", "Gerunds and Infinitives", "Conditional sentences", "Passive Voice"],
  CAE: ["Inversion", "Use of English complex structures", "Participle clauses", "Past modal verbs"],
  DELE: ["Subjuntivo (presente e imperfecto)", "Voz pasiva y pasiva refleja", "Estilo indirecto", "Conectores del discurso", "Perífrasis verbales"],
  SIELE: ["Subjuntivo en distintos contextos", "Oraciones condicionales", "Voz pasiva", "Conectores y marcadores"],
  HSK: ["把字句", "被字句", "复合趋向补语", "程度补语"],
  TOPIK: ["연결어미 (соединительные окончания)", "피동/사동 표현 (пассив и каузатив)", "높임법 (уровни вежливости)"],
  "ОГЭ": ["Времена группы Simple/Continuous/Perfect", "Степени сравнения прилагательных", "Модальные глаголы", "Условные предложения 0–1 типа", "Пассивный залог (базовый)"],
  "ЕГЭ": ["Все времена английского глагола", "Условные предложения 0–3 типа", "Пассивный залог", "Косвенная речь", "Словообразование (задания 29–34)"],
};

const EXAM_VOCAB_BANK = {
  IELTS: ["Academic Word List (AWL)", "Paraphrasing synonyms", "Task 2 opinion & argument vocabulary", "Speaking collocations", "Linking words"],
  TOEFL: ["Academic vocabulary", "Integrated tasks vocabulary", "Synonyms and paraphrase"],
  CAE: ["Idioms and phrasal verbs", "Academic and formal vocabulary", "C1-level collocations"],
  DELE: ["Léxico académico y formal", "Expresiones idiomáticas", "Léxico para expresar opinión", "Marcadores del discurso"],
  SIELE: ["Vocabulario general y académico", "Expresiones coloquiales", "Falsos amigos"],
  HSK: ["HSK核心词汇 (базовая лексика уровня)", "近义词辨析 (различение синонимов)", "四字成语 (устойчивые выражения)"],
  TOPIK: ["TOPIK 필수 어휘 (базовая лексика)", "관용어 (идиомы)", "한자어 (слова китайского происхождения)"],
  "ОГЭ": ["Лексика по темам ФИПИ", "Словообразование", "Базовые фразовые глаголы"],
  "ЕГЭ": ["Лексика по темам ЕГЭ", "Словообразование", "Клише для эссе и письма"],
};


/* ----------------------------- seed data ---------------------------- */

const seedTeachers = [
  { id: "t1", name: "Анна Смирнова", contact: "anna@studyumbrella.ru · +7 900 111-22-33", department: "language", subject: "english", photo: "", bio: "Преподаю английский 8 лет, специализация — подготовка к международным экзаменам.", available: true, availableSpots: null, payoutOverrides: { p1: 850, p2: 4000, p3: 8000 }, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t2", name: "Хавьер Руис", contact: "javier@studyumbrella.ru · +7 900 222-33-44", department: "language", subject: "spanish", photo: "", bio: "Носитель языка из Мадрида, преподаёт разговорный и деловой испанский.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t3", name: "Ли Мэй", contact: "mei.li@studyumbrella.ru · +7 900 333-44-55", department: "language", subject: "chinese", photo: "", bio: "Специалист по подготовке к HSK, опыт преподавания — 5 лет.", available: false, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t4", name: "Пак Джиу", contact: "jiwoo.park@studyumbrella.ru · +7 900 444-55-66", department: "language", subject: "korean", photo: "", bio: "Преподаёт корейский с нуля до продвинутого уровня, готовит к TOPIK.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t5", name: "Игорь Петров", contact: "igor@studyumbrella.ru · +7 900 555-66-77", department: "humanities", subject: "history", photo: "", bio: "Учитель истории, готовит к ЕГЭ и олимпиадам.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t6", name: "Ольга Фёдорова", contact: "olga@studyumbrella.ru · +7 900 666-77-88", department: "humanities", subject: "social", photo: "", bio: "Преподаёт обществознание, автор методических пособий для ЕГЭ.", available: false, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t7", name: "Наталья Кузнецова", contact: "natalia@studyumbrella.ru · +7 900 777-88-99", department: "humanities", subject: "russian", photo: "", bio: "Учитель русского языка и литературы, стаж 12 лет.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
];

const seedStudents = [
  {
    id: "s1", teacherId: "t1", name: "Мария Ковалёва", contact: "+7 901 222-33-44, tg @maria_k",
    startLevel: "A2", currentLevel: "B1", goal: "Подготовка к IELTS для поступления в университет за рубежом", status: "active", planType: "package", startNote: "Хорошая база грамматики, слабый словарный запас по академическим темам.",
    grammarTopics: [
      { id: uid("g"), name: "Present Simple", status: "done" },
      { id: uid("g"), name: "Past Simple", status: "done" },
      { id: uid("g"), name: "Present Perfect", status: "in_progress" },
      { id: uid("g"), name: "Conditionals 0–1", status: "todo" },
    ],
    vocabTopics: [
      { id: uid("v"), name: "Путешествия", status: "done" },
      { id: uid("v"), name: "Работа и карьера", status: "in_progress" },
    ],
    materials: [{ id: uid("m"), title: "Cambridge English IELTS 17", note: "Test 2, Reading & Writing" }],
    homework: [
      { id: uid("hw"), title: "Эссе Opinion Essay", material: "Написать эссе 250 слов на тему 'Online learning vs traditional learning'", materialAttachment: null, dueDate: isoDate(3), status: "assigned", submissionText: "", submissionAttachment: null, submittedAt: null, feedback: "", createdAt: isoDate(-1) },
    ],
    messages: [
      { id: uid("msg"), sender: "teacher", text: "Мария, добавила домашку на эссе, посмотрите, пожалуйста.", attachment: null, reactions: {}, at: new Date(Date.now() - 3600 * 1000 * 20).toISOString() },
    ],
    packageProductId: "p3", packageTotal: 10, packageAssignedAt: isoDate(-40), packageLabel: "Пакет на 10 занятий", checkpoints: [{ id: uid("chk"), title: "IELTS Mock Test", date: isoDate(-6), maxScore: 9, achievedScore: 6.5, note: "Reading и Listening сильные, подтянуть Writing" }],
    examTarget: { exam: "IELTS", targetScore: "7.0", examDate: "" },
    examGrammar: [
      { id: uid("eg"), name: "Пассивный залог в академическом письме", status: "done" },
      { id: uid("eg"), name: "Сложные условные конструкции", status: "in_progress" },
    ],
    examVocab: [
      { id: uid("ev"), name: "Академическая лексика (AWL)", status: "in_progress" },
    ],
    examTopics: [
      { id: uid("ex"), name: "Writing Task 2 (эссе)", status: "in_progress" },
      { id: uid("ex"), name: "Speaking Part 2 (монолог)", status: "todo" },
    ],
    examMaterials: [{ id: uid("em"), title: "Cambridge IELTS 17, Test 2", note: "Reading & Writing", url: "", fileName: "", fileType: "", fileDataUrl: "" }],
    canRequestTeacherChange: false, teacherChangeRequest: null,
    pageTheme: { bannerColor: "", bannerEmoji: "🎓", accentColor: "", stickers: ["⭐", "📚"] },
  },
  {
    id: "s2", teacherId: "t1", name: "Дмитрий Орлов", contact: "+7 903 555-66-77",
    startLevel: "A1", currentLevel: "A1", goal: "Разговорный английский для путешествий", status: "trial", planType: "individual", startNote: "",
    grammarTopics: [{ id: uid("g"), name: "Глагол to be", status: "done" }],
    vocabTopics: [], materials: [], homework: [], messages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
  {
    id: "s3", teacherId: "t5", name: "Елена Волкова", contact: "+7 905 777-88-99, elena.v@mail.ru",
    startLevel: "Базовый", currentLevel: "Средний", goal: "Подготовка к ЕГЭ по истории", status: "active", planType: "package", startNote: "Хорошо знает даты, путается в причинно-следственных связях.",
    grammarTopics: [
      { id: uid("g"), name: "Древний мир", status: "done" },
      { id: uid("g"), name: "Новое время", status: "in_progress" },
      { id: uid("g"), name: "Революции XVIII–XIX вв.", status: "todo" },
    ],
    vocabTopics: [
      { id: uid("v"), name: "Даты и события", status: "done" },
      { id: uid("v"), name: "Исторические личности", status: "todo" },
    ],
    materials: [{ id: uid("m"), title: "Данилов, Косулина — учебник 9 класс", note: "" }],
    homework: [], messages: [],
    packageProductId: "p2", packageTotal: 5, packageAssignedAt: isoDate(-20), packageLabel: "Пакет на 5 занятий", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
  {
    id: "s4", teacherId: "t2", name: "Софья Лебедева", contact: "+7 906 111-22-33",
    startLevel: "A1", currentLevel: "A1", goal: "Испанский для переезда в Барселону", status: "trial", planType: "individual", startNote: "",
    grammarTopics: [{ id: uid("g"), name: "Ser vs Estar", status: "in_progress" }],
    vocabTopics: [], materials: [], homework: [], messages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
];

const SUBJECT_GENITIVE = {
  english: "английскому языку", spanish: "испанскому языку", chinese: "китайскому языку", korean: "корейскому языку",
  history: "истории", social: "обществознанию", russian: "русскому языку",
};

function buildProductsForSubject(subject, dept, idPrefix) {
  const genitive = SUBJECT_GENITIVE[subject];
  return [
    { id: idPrefix + "1", name: "Индивидуальное занятие по " + genitive + ", 60 минут", price: 1400, department: dept, subject, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 700 },
    { id: idPrefix + "2", name: "Пакет на 5 индивидуальных занятий по " + genitive, price: 6000, department: dept, subject, lessonsIncluded: 5, paymentLink: "", payoutPerUnit: 3000 },
    { id: idPrefix + "3", name: "Пакет на 10 индивидуальных занятий по " + genitive, price: 12000, department: dept, subject, lessonsIncluded: 10, paymentLink: "", payoutPerUnit: 6000 },
  ];
}

const seedProducts = [
  ...buildProductsForSubject("english", "language", "p"),
  ...buildProductsForSubject("spanish", "language", "p_es"),
  ...buildProductsForSubject("chinese", "language", "p_zh"),
  ...buildProductsForSubject("korean", "language", "p_ko"),
  ...buildProductsForSubject("history", "humanities", "p_hi"),
  ...buildProductsForSubject("social", "humanities", "p_so"),
  ...buildProductsForSubject("russian", "humanities", "p_ru"),
];

const seedDiscountPercent = 10;

function calcSaleAmount(product, qty, discounted, discountPercent) {
  if (!product) return 0;
  const base = product.price * qty;
  return discounted ? Math.round(base * (1 - discountPercent / 100)) : base;
}

function calcPayout(product, qty, teacher) {
  if (!product) return 0;
  const rate = teacher && teacher.payoutOverrides && teacher.payoutOverrides[product.id] !== undefined
    ? teacher.payoutOverrides[product.id]
    : (product.payoutPerUnit || 0);
  return rate * qty;
}

function daysAgoInMonth(offset) { return isoDate(offset); }

const seedSales = [
  { id: uid("sale"), date: daysAgoInMonth(-40), productId: "p2", qty: 1, discounted: true },
  { id: uid("sale"), date: daysAgoInMonth(-35), productId: "p1", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-28), productId: "p3", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-13), productId: "p2", qty: 1, discounted: true },
  { id: uid("sale"), date: daysAgoInMonth(-12), productId: "p1", qty: 2, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-11), productId: "p3", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-9), productId: "p1", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-8), productId: "p2", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-7), productId: "p1", qty: 1, discounted: true },
  { id: uid("sale"), date: daysAgoInMonth(-5), productId: "p3", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-4), productId: "p1", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-2), productId: "p2", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-1), productId: "p1", qty: 1, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(0), productId: "p1", qty: 1, discounted: false },
].map((s) => ({ ...s, amount: calcSaleAmount(seedProducts.find((p) => p.id === s.productId), s.qty, s.discounted, seedDiscountPercent) }));

const seedSchedule = [
  { id: uid("sl"), teacherId: "t1", studentId: "s1", date: isoDate(1), time: "16:00", duration: 60, type: "regular", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: true, meetingLink: "https://meet.google.com/abc-defg-hij", paymentRequest: null },
  { id: uid("sl"), teacherId: "t1", studentId: "s2", date: isoDate(2), time: "18:00", duration: 45, type: "trial", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t1", studentId: null, date: isoDate(3), time: "18:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t1", studentId: "s1", date: isoDate(-2), time: "16:00", duration: 60, type: "regular", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t5", studentId: "s3", date: isoDate(1), time: "10:00", duration: 60, type: "regular", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t5", studentId: null, date: isoDate(4), time: "10:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t2", studentId: "s4", date: isoDate(2), time: "12:00", duration: 45, type: "trial", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t3", studentId: null, date: isoDate(3), time: "15:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t4", studentId: null, date: isoDate(5), time: "17:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t6", studentId: null, date: isoDate(4), time: "11:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
  { id: uid("sl"), teacherId: "t7", studentId: null, date: isoDate(5), time: "13:00", duration: 45, type: "trial", status: "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null },
];

/* ----------------------------- small UI ----------------------------- */

function Pill({ children, tone = "default" }) {
  return <span className={"pill pill-" + tone}>{children}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: value + "%" }} />
      <span className="progress-label">{value}%</span>
    </div>
  );
}

function MiniBar({ label, value }) {
  if (value === null) return null;
  return (
    <div className="mini-bar-row">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: value + "%" }} /></div>
      <span className="mini-bar-value">{value}%</span>
    </div>
  );
}

function ProgressBreakdown({ student, subjMeta }) {
  const grammar = topicSetProgress(student.grammarTopics);
  const vocab = topicSetProgress(student.vocabTopics);
  const exam = topicSetProgress(student.examTopics);
  const checkpoints = student.checkpoints || [];
  const latestCheckpoint = checkpoints.length ? checkpoints[checkpoints.length - 1] : null;

  return (
    <div className="progress-breakdown">
      <MiniBar label={subjMeta.grammarLabel} value={grammar} />
      <MiniBar label={subjMeta.vocabLabel} value={vocab} />
      {exam !== null && <MiniBar label={"Задания " + (student.examTarget?.exam || "экзамена")} value={exam} />}
      {latestCheckpoint && (
        <div className="hint-text" style={{ marginTop: 4 }}>
          Последняя проверка: {latestCheckpoint.title} — <span className="checkpoint-score">{latestCheckpoint.achievedScore}/{latestCheckpoint.maxScore}</span>
        </div>
      )}
    </div>
  );
}

function LevelLadder({ levels, start, current }) {
  const startIdx = levels.indexOf(start);
  const curIdx = levels.indexOf(current);
  if (startIdx === -1 || curIdx === -1) {
    return (
      <div className="level-fallback">
        <Pill>{start || "—"}</Pill>
        <ArrowRight size={14} />
        <Pill tone="accent">{current || "—"}</Pill>
      </div>
    );
  }
  return (
    <div className="level-ladder">
      {levels.map((lvl, i) => (
        <div key={lvl} className={"ladder-step" + (i <= curIdx ? " filled" : "") + (i === curIdx ? " current" : "")}>
          {i === startIdx && <span className="ladder-tag">старт</span>}
          {lvl}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="empty-state">
      <Icon size={22} />
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
    </div>
  );
}

function Avatar({ name, photo, size = 40 }) {
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (photo) return <img src={photo} alt={name} className="avatar-img" style={{ width: size, height: size }} />;
  return <div className="avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</div>;
}

/* --------------------------- topic selector --------------------------- */

function TopicSelector({ label, options, selected, onAdd, onRemove, onCycle, readOnly }) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const selectedNames = selected.map((s) => s.name);
  const allOptions = Array.from(new Set([...(options || []), ...selectedNames]));

  const symbol = (status) => (status === "done" ? <Check size={11} /> : status === "in_progress" ? "◐" : "○");

  return (
    <div className="topic-selector">
      <div className="field-label">{label}</div>
      {!open && (
        <div className="chip-row">
          {selected.length === 0 && <span className="muted-text">Темы не выбраны</span>}
          {selected.map((item) => (
            <button
              key={item.id}
              className={"chip chip-" + item.status}
              onClick={() => !readOnly && onCycle(item.id)}
              disabled={readOnly}
              title={readOnly ? "" : "Клик — сменить статус: не начато / в процессе / пройдено"}
            >
              <span className="chip-symbol">{symbol(item.status)}</span> {item.name}
            </button>
          ))}
          {!readOnly && (
            <button className="btn-small" onClick={() => setOpen(true)}>
              <Pencil size={11} /> {selected.length ? "Изменить" : "Выбрать темы"}
            </button>
          )}
        </div>
      )}
      {open && !readOnly && (
        <div className="topic-dropdown">
          <div className="row-gap" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <span className="hint-text">Отметьте темы для этого ученика</span>
            <button className="btn-icon" onClick={() => setOpen(false)} title="Закрыть список"><X size={14} /></button>
          </div>
          <div className="topic-dropdown-list">
            {allOptions.map((name) => {
              const existing = selected.find((s) => s.name === name);
              return (
                <label key={name} className="topic-option">
                  <input type="checkbox" checked={!!existing} onChange={() => (existing ? onRemove(existing.id) : onAdd(name))} />
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
          <div className="row-gap">
            <input className="mini-input wide" placeholder="Своя тема (если нет в списке)" value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <button className="btn-icon" disabled={!customName.trim()} onClick={() => { onAdd(customName.trim()); setCustomName(""); }} title="Добавить свою тему"><Plus size={14} /></button>
          </div>
          <button className="btn-small accent" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
            <Check size={12} /> Готово, закрыть список
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------- attachment helpers ------------------------ */

const MAX_ATTACHMENT_BYTES = 1.5 * 1024 * 1024;

function AttachFileButton({ onPicked, label }) {
  const [busy, setBusy] = useState(false);
  async function handle(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) { alert("Файл слишком большой (максимум ~1.5 МБ для этого прототипа)."); return; }
    setBusy(true);
    try {
      const dataUrl = await fileToDataURL(file);
      onPicked({ name: file.name, type: file.type, dataUrl });
    } catch (err) { console.error(err); }
    setBusy(false);
  }
  return (
    <label className="btn-small">
      <Paperclip size={12} /> {busy ? "Загрузка…" : (label || "Прикрепить файл")}
      <input type="file" onChange={handle} style={{ display: "none" }} />
    </label>
  );
}

function AttachmentView({ attachment, onRemove }) {
  if (!attachment) return null;
  const isImage = (attachment.type || "").startsWith("image/");
  return (
    <div className="attachment-chip">
      {isImage ? (
        <a href={attachment.dataUrl} target="_blank" rel="noreferrer"><img src={attachment.dataUrl} alt={attachment.name} className="attachment-thumb" /></a>
      ) : (
        <a href={attachment.dataUrl} download={attachment.name} className="attachment-file">
          <Paperclip size={12} /> {attachment.name}
        </a>
      )}
      {onRemove && <button className="topic-remove" onClick={onRemove}><X size={12} /></button>}
    </div>
  );
}

/* --------------------------- materials list --------------------------- */

function MaterialsList({ items, onAdd, onRemove, readOnly }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  return (
    <div>
      <ul className="materials-list">
        {items.length === 0 && <li className="muted-text">Материалы пока не добавлены</li>}
        {items.map((m) => (
          <li key={m.id}>
            <BookOpen size={13} />
            <span><strong>{m.title}</strong>{m.note ? " — " + m.note : ""}</span>
            {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="material-link">ссылка</a>}
            {m.fileDataUrl && <AttachmentView attachment={{ name: m.fileName, type: m.fileType, dataUrl: m.fileDataUrl }} />}
            {!readOnly && <button className="topic-remove" onClick={() => onRemove(m.id)}><X size={12} /></button>}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <div className="add-panel" style={{ marginTop: 6 }}>
          <div className="row-gap">
            <input className="mini-input" placeholder="Учебник / материал" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="mini-input wide" placeholder="Комментарий (юнит, страницы...)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="row-gap">
            <input className="mini-input wide" placeholder="Ссылка (видео, аудио, документ)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <AttachFileButton label={file ? file.name : "Файл / картинка"} onPicked={setFile} />
            {file && <button className="btn-small" onClick={() => setFile(null)}>Убрать файл</button>}
          </div>
          <button
            className="btn-icon"
            disabled={!title.trim()}
            onClick={() => {
              onAdd(title.trim(), note.trim(), url.trim(), file);
              setTitle(""); setNote(""); setUrl(""); setFile(null);
            }}
          ><Plus size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* --------------------------- homework panel --------------------------- */

function HomeworkPanel({ student, actions, role, canAct }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", material: "", dueDate: isoDate(3) });
  const [formAttachment, setFormAttachment] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [draftAttachments, setDraftAttachments] = useState({});
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const items = [...(student.homework || [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <div>
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <div className="field-label" style={{ margin: 0 }}>Домашние задания</div>
        {role === "teacher" && canAct && (
          <button className="btn-icon" onClick={() => setShowAdd((v) => !v)} title="Добавить задание"><Plus size={14} /></button>
        )}
      </div>

      {showAdd && role === "teacher" && canAct && (
        <div className="add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="hint-text">Новое домашнее задание</span>
            <button className="btn-icon" onClick={() => setShowAdd(false)} title="Закрыть"><X size={14} /></button>
          </div>
          <input className="mini-input wide" placeholder="Название задания" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="mini-textarea" placeholder="Материалы / инструкции / ссылка" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <div className="row-gap">
            <AttachFileButton label={formAttachment ? formAttachment.name : "Прикрепить файл"} onPicked={setFormAttachment} />
            {formAttachment && <button className="btn-small" onClick={() => setFormAttachment(null)}>Убрать</button>}
          </div>
          <div className="row-gap">
            <span className="hint-text">Срок:</span>
            <input type="date" className="mini-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <button
            className="btn-small accent"
            disabled={!form.title.trim()}
            onClick={() => { actions.addHomework(student.id, { ...form, materialAttachment: formAttachment }); setForm({ title: "", material: "", dueDate: isoDate(3) }); setFormAttachment(null); setShowAdd(false); }}
          >
            <Check size={12} /> Добавить задание
          </button>
        </div>
      )}

      <div className="homework-list">
        {items.length === 0 && <EmptyState icon={BookOpen} title="Заданий пока нет" />}
        {items.map((hw) => (
          <div key={hw.id} className="homework-item">
            <div className="row-gap" style={{ justifyContent: "space-between" }}>
              <strong>{hw.title}</strong>
              <Pill tone={HOMEWORK_STATUS_TONE[hw.status]}>
                {HOMEWORK_STATUS_LABELS[hw.status]}
              </Pill>
            </div>
            {hw.material && <p className="body-text" style={{ marginTop: 4 }}>{hw.material}</p>}
            {hw.materialAttachment && <AttachmentView attachment={hw.materialAttachment} />}
            {hw.dueDate && <div className="hint-text">Срок: {formatDate(hw.dueDate)}</div>}

            {role === "student" && (
              <div style={{ marginTop: 8 }}>
                {(hw.status === "assigned" || hw.status === "needs_revision") ? (
                  <>
                    {hw.status === "needs_revision" && hw.feedback && (
                      <div className="hw-feedback" style={{ marginBottom: 6 }}><strong>Замечания учителя:</strong> {hw.feedback}</div>
                    )}
                    <textarea
                      className="mini-textarea"
                      placeholder="Ваш ответ / ссылка на выполненную работу"
                      value={drafts[hw.id] ?? hw.submissionText ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [hw.id]: e.target.value })}
                    />
                    <div className="row-gap" style={{ marginTop: 6 }}>
                      <AttachFileButton label={draftAttachments[hw.id]?.name || (hw.submissionAttachment?.name) || "Прикрепить файл"} onPicked={(a) => setDraftAttachments({ ...draftAttachments, [hw.id]: a })} />
                      <button
                        className="btn-small accent"
                        disabled={!(drafts[hw.id] ?? hw.submissionText ?? "").trim() && !draftAttachments[hw.id]}
                        onClick={() => actions.submitHomework(student.id, hw.id, drafts[hw.id] ?? hw.submissionText ?? "", draftAttachments[hw.id] || hw.submissionAttachment || null)}
                      >
                        <Send size={12} /> {hw.status === "needs_revision" ? "Отправить исправленный вариант" : "Отправить ответ"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="hw-submission">
                    <div className="hint-text">Ваш ответ ({formatDateTime(hw.submittedAt)}):</div>
                    <p className="body-text">{hw.submissionText}</p>
                    {hw.submissionAttachment && <AttachmentView attachment={hw.submissionAttachment} />}
                    {hw.status === "reviewed" && hw.feedback && <div className="hw-feedback"><strong>Комментарий учителя:</strong> {hw.feedback}</div>}
                  </div>
                )}
              </div>
            )}

            {role === "teacher" && (
              <div style={{ marginTop: 8 }}>
                {(hw.submissionText || hw.submissionAttachment) ? (
                  <div className="hw-submission">
                    <div className="hint-text">Ответ ученика ({formatDateTime(hw.submittedAt)}):</div>
                    <p className="body-text">{hw.submissionText}</p>
                    {hw.submissionAttachment && <AttachmentView attachment={hw.submissionAttachment} />}

                    {canAct && hw.status === "submitted" && (
                      <button className="btn-small" style={{ marginTop: 6 }} onClick={() => actions.markHomeworkInReview(student.id, hw.id)}>Взять на проверку</button>
                    )}

                    {canAct && (hw.status === "submitted" || hw.status === "in_review") && (
                      <>
                        <textarea
                          className="mini-textarea"
                          style={{ marginTop: 6 }}
                          placeholder="Комментарий / замечания (нужны, если возвращаете на доработку)"
                          value={feedbackDrafts[hw.id] ?? ""}
                          onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [hw.id]: e.target.value })}
                        />
                        <div className="row-gap">
                          <button className="btn-small accent" onClick={() => actions.reviewHomework(student.id, hw.id, feedbackDrafts[hw.id] || "")}>
                            <Check size={12} /> Принять
                          </button>
                          <button
                            className="btn-small danger"
                            disabled={!(feedbackDrafts[hw.id] || "").trim()}
                            onClick={() => actions.sendHomeworkForRevision(student.id, hw.id, feedbackDrafts[hw.id])}
                          >
                            Вернуть с замечаниями
                          </button>
                        </div>
                      </>
                    )}
                    {hw.status === "needs_revision" && hw.feedback && <div className="hw-feedback"><strong>Замечания отправлены:</strong> {hw.feedback}</div>}
                    {hw.status === "reviewed" && (
                      <>
                        {hw.feedback && <div className="hw-feedback"><strong>Ваш комментарий:</strong> {hw.feedback}</div>}
                        {canAct && (
                          <button className="btn-small" style={{ marginTop: 6 }} onClick={() => actions.reopenHomework(student.id, hw.id)}><RotateCcw size={11} /> Отменить проверку</button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <span className="muted-text">Ученик ещё не отправил ответ</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- message panel --------------------------- */

const MESSAGE_REACTIONS = ["👍", "❤️", "😂", "🎉"];

function VoiceRecordButton({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const dataUrl = await fileToDataURL(blob);
        onRecorded({ name: "Голосовое сообщение", type: "audio/webm", dataUrl });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.error(e);
      setError("Браузер не дал доступ к микрофону (заблокировано настройками сайта/браузера или платформой показа этой страницы) — голосовые сообщения тут недоступны, попробуйте открыть страницу отдельной вкладкой и разрешить доступ к микрофону.");
    }
  }

  function stop() {
    if (mediaRef.current) mediaRef.current.stop();
    setRecording(false);
  }

  return (
    <>
      <button className={"btn-icon" + (recording ? " danger" : "")} onClick={recording ? stop : start} title={recording ? "Остановить запись" : "Записать голосовое сообщение"}>
        {recording ? "■" : "🎙"}
      </button>
      {error && <span className="hint-text" style={{ color: "var(--danger)" }}>{error}</span>}
    </>
  );
}

function MessageBubble({ m, isMine, who, role, onToggleReaction }) {
  const [showReactions, setShowReactions] = useState(false);
  const pressTimer = React.useRef(null);
  const reactions = m.reactions || {};

  function startPress() {
    pressTimer.current = setTimeout(() => setShowReactions(true), 450);
  }
  function endPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  return (
    <div className={"chat-row " + (isMine ? "mine" : "theirs")}>
      {!isMine && <Avatar name={who.name} photo={who.photo} size={26} />}
      <div className="chat-bubble-wrap">
        <div
          className={"chat-bubble " + (isMine ? "mine" : "theirs")}
          onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
          onTouchStart={startPress} onTouchEnd={endPress}
          onClick={() => { if (showReactions) setShowReactions(false); }}
        >
          {m.text && <div>{m.text}</div>}
          {m.attachment && (m.attachment.type || "").startsWith("audio/") ? (
            <audio controls src={m.attachment.dataUrl} style={{ maxWidth: 220, marginTop: 4 }} />
          ) : (
            m.attachment && <AttachmentView attachment={m.attachment} />
          )}
          <div className="chat-time">{formatDateTime(m.at)}</div>
        </div>
        {Object.keys(reactions).length > 0 && !showReactions && (
          <div className="chat-reactions-summary">
            {Object.values(reactions).map((emoji, i) => <span key={i}>{emoji}</span>)}
          </div>
        )}
        {showReactions && (
          <div className="chat-reactions">
            {MESSAGE_REACTIONS.map((emoji) => {
              const mineReacted = reactions[role] === emoji;
              return (
                <button key={emoji} className={"reaction-btn" + (mineReacted ? " active" : "")} onClick={() => { onToggleReaction(m.id, emoji); setShowReactions(false); }}>
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {isMine && <Avatar name={who.name} photo={who.photo} size={26} />}
    </div>
  );
}

function SimpleChatPanel({ messages, onSend, onToggleReaction, role, canAct, selfName, selfPhoto, otherName, otherPhoto, otherRoleKey, placeholder }) {
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const boxRef = React.useRef(null);
  const list = messages || [];

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [list.length]);

  function send() {
    if (!text.trim() && !pendingAttachment) return;
    onSend(text.trim(), pendingAttachment);
    setText("");
    setPendingAttachment(null);
  }

  return (
    <div>
      <div className="chat-box" ref={boxRef}>
        {list.length === 0 && <div className="muted-text" style={{ padding: "10px 0" }}>Сообщений пока нет</div>}
        {list.map((m) => {
          const isMine = m.sender === role;
          const who = m.sender === role ? { name: selfName, photo: selfPhoto } : { name: otherName, photo: otherPhoto };
          return <MessageBubble key={m.id} m={m} isMine={isMine} who={who} role={role} onToggleReaction={onToggleReaction} />;
        })}
      </div>
      {canAct && (
        <div>
          {pendingAttachment && (
            <div className="row-gap" style={{ marginBottom: 6 }}>
              <AttachmentView attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
            </div>
          )}
          <div className="row-gap" style={{ marginTop: 8 }}>
            <input
              className="mini-input wide"
              placeholder={placeholder || "Написать сообщение…"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <AttachFileButton label="" onPicked={setPendingAttachment} />
            <button className="btn-icon" disabled={!text.trim() && !pendingAttachment} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagePanel({ student, actions, role, canAct, teacherName, teacherPhoto, studentName }) {
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const messages = student.messages || [];
  const boxRef = React.useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages.length]);

  function send() {
    if (!text.trim() && !pendingAttachment) return;
    actions.sendMessage(student.id, role, text.trim(), pendingAttachment);
    setText("");
    setPendingAttachment(null);
  }

  function toggleReaction(messageId, emoji) {
    actions.toggleMessageReaction(student.id, messageId, role, emoji);
  }

  return (
    <div>
      <div className="field-label">Переписка</div>
      <div className="hint-text" style={{ marginBottom: 6 }}>Долгое нажатие на сообщение — поставить реакцию</div>
      <div className="chat-box" ref={boxRef}>
        {messages.length === 0 && <div className="muted-text" style={{ padding: "10px 0" }}>Сообщений пока нет</div>}
        {messages.map((m) => {
          const isMine = m.sender === role;
          const who = m.sender === "teacher" ? { name: teacherName || "Учитель", photo: teacherPhoto } : { name: studentName || "Ученик", photo: "" };
          return <MessageBubble key={m.id} m={m} isMine={isMine} who={who} role={role} onToggleReaction={toggleReaction} />;
        })}
      </div>
      {canAct && (
        <div>
          {pendingAttachment && (
            <div className="row-gap" style={{ marginBottom: 6 }}>
              <AttachmentView attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
            </div>
          )}
          <div className="row-gap" style={{ marginTop: 8 }}>
            <input
              className="mini-input wide"
              placeholder="Написать сообщение…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <AttachFileButton label="" onPicked={setPendingAttachment} />
            <VoiceRecordButton onRecorded={setPendingAttachment} />
            <button className="btn-icon" disabled={!text.trim() && !pendingAttachment} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- slot row ------------------------------ */

function SlotRow({ slot, students, readOnly, onAssign, onCancel, onReschedule, onResolveRequest, onRequestReschedule, teacherLabel, onAddSlotTopic, onRemoveSlotTopic, onSetSlotMaterial, onTogglePaid, onSetMeetingLink, onSetSlotPaymentLink, onPayForSlot, onConfirmPayment, onDismissPaymentRequest, onEditDetails, products, teachers }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(slot.date);
  const [time, setTime] = useState(slot.time);
  const [assignId, setAssignId] = useState("");
  const [reqDate, setReqDate] = useState(slot.date);
  const [reqTime, setReqTime] = useState(slot.time);
  const [reqNote, setReqNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [newTopicTag, setNewTopicTag] = useState("");
  const [materialDraft, setMaterialDraft] = useState(slot.lessonMaterial || "");
  const [showLessonNotes, setShowLessonNotes] = useState(false);
  const [linkDraft, setLinkDraft] = useState(slot.meetingLink || "");
  const [payLinkDraft, setPayLinkDraft] = useState(slot.slotPaymentLink || "");
  const [editingPayLink, setEditingPayLink] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [paying, setPaying] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({ duration: slot.duration, type: slot.type, trialName: slot.trialName || "" });
  const [payForm, setPayForm] = useState({ productId: products?.[0]?.id || "", teacherId: slot.teacherId });

  const student = students.find((s) => s.id === slot.studentId);
  const hasLessonInfo = (slot.topicsCovered && slot.topicsCovered.length > 0) || (slot.lessonMaterial && slot.lessonMaterial.trim());
  const isFuture = slot.date >= isoDate(0);

  return (
    <div className={"slot-row status-" + slot.status}>
      <div className="slot-when">
        <div className="slot-date">{formatDate(slot.date)}</div>
        <div className="slot-time"><Clock size={12} /> {slot.time} · {slot.duration} мин</div>
      </div>

      <div className="slot-mid">
        {teacherLabel && <span className="slot-student">{teacherLabel}</span>}
        <Pill tone={slot.type === "trial" ? "gold" : "default"}>{TYPE_LABELS[slot.type]}</Pill>
        <Pill tone={slot.status === "booked" ? "accent" : slot.status === "reschedule-requested" ? "gold" : slot.status === "cancelled" ? "danger" : "default"}>
          {SLOT_STATUS_LABELS[slot.status]}
        </Pill>
        {student && (
          !readOnly ? (
            <button className={"pill pill-clickable " + (slot.paid ? "pill-accent" : "pill-danger")} onClick={() => onTogglePaid(slot.id)} title="Отметить оплату">
              {slot.paid ? "Оплачено ✓" : "Не оплачено"}
            </button>
          ) : (
            <Pill tone={slot.paid ? "accent" : "danger"}>{slot.paid ? "Оплачено" : "Не оплачено"}</Pill>
          )
        )}
        {student && <span className="slot-student">{student.name}</span>}
        {!student && slot.trialName && <span className="slot-student">{slot.trialName} <Pill tone="gold">не в системе</Pill></span>}
        {slot.status === "reschedule-requested" && slot.requested && (
          <span className="slot-request-note">
            предложено: {formatDate(slot.requested.date)} {slot.requested.time}
            {slot.requested.note ? " — «" + slot.requested.note + "»" : ""}
          </span>
        )}
      </div>

      {student && !slot.paid && (
        <div className="meeting-link-row">
          {!readOnly ? (
            editingPayLink ? (
              <div className="row-gap">
                <input className="mini-input wide" placeholder="Ссылка на оплату этого занятия (ЮKassa и т.п.)" value={payLinkDraft} onChange={(e) => setPayLinkDraft(e.target.value)} />
                <button className="btn-icon" onClick={() => { onSetSlotPaymentLink(slot.id, payLinkDraft); setEditingPayLink(false); }}><Check size={12} /></button>
                <button className="btn-icon" onClick={() => setEditingPayLink(false)}><X size={12} /></button>
              </div>
            ) : (
              <button className="btn-small" onClick={() => setEditingPayLink(true)}>💳 {slot.slotPaymentLink ? "Изменить ссылку на оплату" : "Добавить ссылку на оплату"}</button>
            )
          ) : (
            slot.slotPaymentLink && <a href={slot.slotPaymentLink} target="_blank" rel="noreferrer" className="btn-small accent">💳 Оплатить по ссылке</a>
          )}
        </div>
      )}

      {student && (
        <div className="meeting-link-row">
          {!readOnly ? (
            editingLink ? (
              <div className="row-gap">
                <input className="mini-input wide" placeholder="Ссылка на занятие (Zoom/Meet/Skype)" value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} />
                <button className="btn-icon" onClick={() => { onSetMeetingLink(slot.id, linkDraft); setEditingLink(false); }}><Check size={12} /></button>
                <button className="btn-icon" onClick={() => setEditingLink(false)}><X size={12} /></button>
              </div>
            ) : (
              <button className="btn-small" onClick={() => setEditingLink(true)}><Paperclip size={11} /> {slot.meetingLink ? "Изменить ссылку на занятие" : "Добавить ссылку на занятие"}</button>
            )
          ) : slot.paid ? (
            slot.meetingLink ? <a href={slot.meetingLink} target="_blank" rel="noreferrer" className="attachment-file">🔗 Ссылка на занятие</a> : <span className="muted-text">Ссылка пока не добавлена учителем</span>
          ) : (
            <span className="muted-text locked-link">🔒 Ссылка появится после оплаты</span>
          )}
        </div>
      )}

      {readOnly && student && !slot.paid && onPayForSlot && (
        <div className="pay-slot-row">
          {slot.paymentRequest ? (
            <div className="hint-text">💳 Запрос на оплату отправлен {formatDateTime(slot.paymentRequest.requestedAt)}, ожидайте подтверждения от учителя.</div>
          ) : !paying ? (
            <button className="btn-small accent" onClick={() => setPaying(true)}>💳 Оплатить занятие</button>
          ) : (
            <div className="add-panel">
              <select className="mini-select" value={payForm.productId} onChange={(e) => setPayForm({ ...payForm, productId: e.target.value })}>
                {(products || []).map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtMoney(p.price)}</option>)}
              </select>
              <select className="mini-select" value={payForm.teacherId} onChange={(e) => setPayForm({ ...payForm, teacherId: e.target.value })}>
                {(teachers || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {(() => {
                const chosen = (products || []).find((p) => p.id === payForm.productId);
                return chosen && chosen.paymentLink ? (
                  <a className="btn-small accent" href={chosen.paymentLink} target="_blank" rel="noreferrer">🔗 Перейти к оплате в ЮKassa</a>
                ) : (
                  <div className="hint-text">Ссылка на оплату для этого товара пока не настроена администратором — оплатите school напрямую и нажмите кнопку ниже.</div>
                );
              })()}
              <div className="row-gap">
                <button className="btn-small" onClick={() => { onPayForSlot(slot.id, payForm); setPaying(false); }}>📨 Сообщить учителю об оплате</button>
                <button className="btn-small" onClick={() => setPaying(false)}>Отмена</button>
              </div>
              <div className="hint-text">Это не подтверждение оплаты — только уведомление. Занятие станет отмеченным как оплаченное после проверки учителем или администратором.</div>
            </div>
          )}
        </div>
      )}

      {!readOnly && slot.paymentRequest && !slot.paid && (
        <div className="pay-slot-row">
          <div className="add-panel">
            <div className="hint-text">💳 Ученик сообщил об оплате {formatDateTime(slot.paymentRequest.requestedAt)}. Подтвердите после проверки поступления средств.</div>
            <div className="row-gap">
              <button className="btn-small accent" onClick={() => onConfirmPayment(slot.id)}><Check size={12} /> Подтвердить оплату</button>
              <button className="btn-small" onClick={() => onDismissPaymentRequest(slot.id)}>Отклонить</button>
            </div>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="slot-actions">
          {slot.status === "available" && (
            <>
              <select value={assignId} onChange={(e) => setAssignId(e.target.value)} className="mini-select">
                <option value="">Назначить ученика…</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="btn-icon" disabled={!assignId} onClick={() => { onAssign(slot.id, assignId); setAssignId(""); }} title="Забронировать"><Check size={14} /></button>
              <button className="btn-icon danger" onClick={() => onCancel(slot.id)} title="Удалить слот"><Trash2 size={14} /></button>
            </>
          )}

          {slot.status === "booked" && !editing && !editingDetails && (
            <>
              <button className="btn-small" onClick={() => setEditing(true)}><Pencil size={12} /> Перенести</button>
              {onEditDetails && <button className="btn-small" onClick={() => { setDetailsDraft({ duration: slot.duration, type: slot.type, trialName: slot.trialName || "" }); setEditingDetails(true); }}><Pencil size={12} /> Изменить детали</button>}
              <button className="btn-icon danger" onClick={() => onCancel(slot.id)} title="Отменить"><Trash2 size={14} /></button>
            </>
          )}

          {slot.status === "booked" && editingDetails && (
            <div className="add-panel">
              <div className="row-gap">
                <select className="mini-select" value={detailsDraft.duration} onChange={(e) => setDetailsDraft({ ...detailsDraft, duration: Number(e.target.value) })}>
                  <option value={30}>30 мин</option><option value={45}>45 мин</option><option value={60}>60 мин</option><option value={90}>90 мин</option>
                </select>
                <select className="mini-select" value={detailsDraft.type} onChange={(e) => setDetailsDraft({ ...detailsDraft, type: e.target.value })}>
                  <option value="trial">Пробный урок</option><option value="regular">Обычный урок</option>
                </select>
              </div>
              {!slot.studentId && (
                <input className="mini-input wide" placeholder="Имя записавшегося" value={detailsDraft.trialName} onChange={(e) => setDetailsDraft({ ...detailsDraft, trialName: e.target.value })} />
              )}
              <div className="row-gap">
                <button className="btn-icon" onClick={() => { onEditDetails(slot.id, detailsDraft); setEditingDetails(false); }} title="Сохранить"><Check size={14} /></button>
                <button className="btn-icon" onClick={() => setEditingDetails(false)} title="Отмена"><X size={14} /></button>
              </div>
            </div>
          )}

          {slot.status === "booked" && editing && (
            <>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mini-input" />
              <select className="mini-select" value={time} onChange={(e) => setTime(e.target.value)}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <button className="btn-icon" onClick={() => { onReschedule(slot.id, date, time); setEditing(false); }} title="Сохранить"><Check size={14} /></button>
              <button className="btn-icon" onClick={() => setEditing(false)} title="Отмена"><X size={14} /></button>
            </>
          )}

          {slot.status === "reschedule-requested" && (
            <>
              <button className="btn-small accent" onClick={() => onResolveRequest(slot.id, true)}>Принять перенос</button>
              <button className="btn-small" onClick={() => onResolveRequest(slot.id, false)}>Отклонить</button>
            </>
          )}
        </div>
      )}

      {readOnly && slot.status === "booked" && onRequestReschedule && !asking && new Date(slot.date) >= new Date(isoDate(0)) && (
        <div className="slot-actions">
          <button className="btn-small" onClick={() => setAsking(true)}><RotateCcw size={12} /> Предложить перенос</button>
        </div>
      )}

      {readOnly && asking && (
        <div className="slot-actions">
          <input type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} className="mini-input" />
          <select className="mini-select" value={reqTime} onChange={(e) => setReqTime(e.target.value)}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <input type="text" placeholder="Комментарий (необязательно)" value={reqNote} onChange={(e) => setReqNote(e.target.value)} className="mini-input wide" />
          <button className="btn-icon" onClick={() => { onRequestReschedule(slot.id, reqDate, reqTime, reqNote); setAsking(false); }}><Check size={14} /></button>
          <button className="btn-icon" onClick={() => setAsking(false)}><X size={14} /></button>
        </div>
      )}

      {slot.history && slot.history.length > 0 && (
        <div className="slot-history">
          история переносов: {slot.history.map((h, i) => (
            <span key={i}>{formatDate(h.date)} {h.time}{i < slot.history.length - 1 ? " → " : ""}</span>
          ))}
        </div>
      )}

      {slot.studentId && (readOnly ? hasLessonInfo : true) && (
        <div className="lesson-notes">
          {!readOnly && (
            <button className="btn-small" onClick={() => setShowLessonNotes((v) => !v)}>
              <BookOpen size={11} /> {showLessonNotes ? "Скрыть заметки урока" : (isFuture ? "Тема и план урока" : "Пройденные темы и материалы")}
            </button>
          )}

          {(readOnly || showLessonNotes) && (
            <div className="lesson-notes-body">
              {(slot.topicsCovered && slot.topicsCovered.length > 0) && (
                <div className="chip-row" style={{ marginBottom: 6 }}>
                  {slot.topicsCovered.map((name) => (
                    <span key={name} className={"chip " + (isFuture ? "chip-in_progress" : "chip-done")}>
                      {name}
                      {!readOnly && <button className="topic-remove" style={{ marginLeft: 4 }} onClick={() => onRemoveSlotTopic(slot.id, name)}><X size={10} /></button>}
                    </span>
                  ))}
                </div>
              )}
              {!readOnly && (
                <div className="row-gap" style={{ marginBottom: 8 }}>
                  <input className="mini-input wide" placeholder={isFuture ? "Тема урока (Enter)" : "Пройденная тема (Enter)"} value={newTopicTag}
                    onChange={(e) => setNewTopicTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newTopicTag.trim()) { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); } }}
                  />
                  <button className="btn-icon" disabled={!newTopicTag.trim()} onClick={() => { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); }}><Plus size={13} /></button>
                </div>
              )}

              {readOnly ? (
                slot.lessonMaterial && <p className="body-text">{slot.lessonMaterial}</p>
              ) : (
                <>
                  <textarea
                    className="mini-textarea"
                    placeholder={isFuture ? "План урока, материалы к занятию, ссылки..." : "Материалы для повторения, ссылка на запись урока, видео..."}
                    value={materialDraft}
                    onChange={(e) => setMaterialDraft(e.target.value)}
                    onBlur={() => onSetSlotMaterial(slot.id, materialDraft)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- schedule table --------------------------- */

function PastLessonCard({ slot, students, editable, onAddSlotTopic, onRemoveSlotTopic, onSetSlotMaterial }) {
  const student = students.find((s) => s.id === slot.studentId);
  const [newTopicTag, setNewTopicTag] = useState("");
  const [materialDraft, setMaterialDraft] = useState(slot.lessonMaterial || "");

  if (slot.status === "cancelled") {
    return (
      <div className="past-lesson-card cancelled">
        <div className="row-gap" style={{ justifyContent: "space-between" }}>
          <strong>{formatDate(slot.date)}, {slot.time}</strong>
          <Pill tone="danger">Отменено</Pill>
        </div>
        {(student || slot.trialName) && <div className="muted-text">{student ? student.name : slot.trialName}</div>}
      </div>
    );
  }

  return (
    <div className="past-lesson-card">
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <strong>{formatDate(slot.date)}, {slot.time}</strong>
        <Pill tone={slot.paid ? "accent" : "danger"}>{slot.paid ? "Оплачено" : "Не оплачено"}</Pill>
      </div>
      {(student || slot.trialName) && <div className="muted-text" style={{ marginBottom: 6 }}>{student ? student.name : slot.trialName + " (не в системе)"}</div>}

      <div className="field-label" style={{ marginTop: 4 }}>Пройденные темы</div>
      {slot.topicsCovered && slot.topicsCovered.length > 0 && (
        <div className="chip-row" style={{ marginBottom: 6 }}>
          {slot.topicsCovered.map((name) => (
            <span key={name} className="chip chip-done">
              {name}
              {editable && <button className="topic-remove" style={{ marginLeft: 4 }} onClick={() => onRemoveSlotTopic(slot.id, name)}><X size={10} /></button>}
            </span>
          ))}
        </div>
      )}
      {editable && (
        <div className="row-gap" style={{ marginBottom: 8 }}>
          <input
            className="mini-input wide" placeholder="Пройденная тема (Enter)" value={newTopicTag}
            onChange={(e) => setNewTopicTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newTopicTag.trim()) { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); } }}
          />
          <button className="btn-icon" disabled={!newTopicTag.trim()} onClick={() => { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); }}><Plus size={13} /></button>
        </div>
      )}

      <div className="field-label">Детали урока и материалы для повторения</div>
      {editable ? (
        <textarea
          className="mini-textarea" placeholder="Что было на уроке, материалы для повторения, ссылка на запись..."
          value={materialDraft} onChange={(e) => setMaterialDraft(e.target.value)}
          onBlur={() => onSetSlotMaterial(slot.id, materialDraft)}
        />
      ) : (
        slot.lessonMaterial ? <p className="body-text">{slot.lessonMaterial}</p> : <span className="muted-text">Учитель ещё не оставил заметки</span>
      )}
    </div>
  );
}

function PastLessonsSection({ count, children }) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;
  return (
    <div className="past-lessons-section">
      <button className="past-lessons-toggle" onClick={() => setOpen((v) => !v)}>
        <span className={"past-chevron" + (open ? " open" : "")}>›</span> Прошедшие занятия ({count}){!open && " — показать"}
      </button>
      {open && <div className="slot-list past-list">{children}</div>}
    </div>
  );
}

function LessonPlanTimeline({ slots }) {
  const todayIso = isoDate(0);
  const relevant = slots
    .filter((sl) => sl.studentId && sl.status !== "cancelled" && ((sl.topicsCovered && sl.topicsCovered.length > 0) || (sl.lessonMaterial && sl.lessonMaterial.trim())))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (relevant.length === 0) return null;

  return (
    <div className="field-block">
      <div className="field-label">План занятий: пройденные и предстоящие темы</div>
      <div className="lesson-plan-timeline">
        {relevant.map((sl) => {
          const isPast = sl.date < todayIso;
          return (
            <div key={sl.id} className={"lesson-plan-row " + (isPast ? "done" : "upcoming")}>
              <div className="lesson-plan-dot" />
              <div className="lesson-plan-body">
                <div className="row-gap" style={{ justifyContent: "space-between" }}>
                  <strong>{formatDate(sl.date)}</strong>
                  <Pill tone={isPast ? "accent" : "gold"}>{isPast ? "Пройдено" : "Запланировано"}</Pill>
                </div>
                {sl.topicsCovered && sl.topicsCovered.length > 0 && (
                  <div className="chip-row" style={{ marginTop: 4 }}>
                    {sl.topicsCovered.map((t) => <span key={t} className={"chip " + (isPast ? "chip-done" : "chip-in_progress")}>{t}</span>)}
                  </div>
                )}
                {sl.lessonMaterial && <p className="body-text" style={{ marginTop: 4 }}>{sl.lessonMaterial}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleTable({ slots, students, teacherId, teacherOptions, teachersById, editable, actions, mode, products, allTeachers }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [addingCell, setAddingCell] = useState(null);
  const [addForm, setAddForm] = useState({ time: "17:00", duration: 60, type: "trial", teacherId: teacherId || (teacherOptions && teacherOptions[0]?.id), studentId: "", trialName: "" });
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const dayIso = (d) => localDateStr(d);
  const todayIso = isoDate(0);

  const weekSlots = slots.filter((sl) => sl.status !== "cancelled" && days.some((d) => dayIso(d) === sl.date));
  const selectedSlot = slots.find((sl) => sl.id === selectedSlotId);

  function studentsFor(tid) {
    return teachersById ? students.filter((s) => s.teacherId === tid) : students;
  }

  function cellSlots(dateIso, hour) {
    return weekSlots.filter((sl) => sl.date === dateIso && sl.time.slice(0, 2) === hour.slice(0, 2));
  }

  function openAdd(dateIso, hour) {
    setSelectedSlotId(null);
    setAddingCell({ date: dateIso, hourClicked: hour });
    setAddForm({ time: hour, duration: 60, type: "trial", teacherId: teacherId || (teacherOptions && teacherOptions[0]?.id), studentId: "", trialName: "" });
  }

  function submitAdd() {
    actions.addSlot(addForm.teacherId, {
      date: addingCell.date, time: addForm.time, duration: addForm.duration, type: addForm.type,
      studentId: addForm.studentId || null, trialName: addForm.trialName.trim(),
    });
    setAddingCell(null);
  }

  return (
    <div className="schedule-wrap">
      <div className="schedule-nav">
        <button className="btn-small" onClick={() => setWeekStart(shiftWeek(weekStart, -1))}>← Пред. неделя</button>
        <span className="schedule-range">{fmtWeekRange(days[0], days[6])}</span>
        <button className="btn-small" onClick={() => setWeekStart(mondayOf(new Date()))}>Сегодня</button>
        <button className="btn-small" onClick={() => setWeekStart(shiftWeek(weekStart, 1))}>След. неделя →</button>
      </div>

      <div className="schedule-grid-scroll">
        <div className="schedule-grid" style={{ gridTemplateColumns: "56px repeat(7,1fr)" }}>
          <div className="schedule-corner" />
          {days.map((d) => (
            <div key={dayIso(d)} className={"schedule-day-head" + (dayIso(d) === todayIso ? " is-today" : "")}>
              <div className="schedule-day-name">{d.toLocaleDateString("ru-RU", { weekday: "short" })}</div>
              <div className="schedule-day-date">{d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</div>
            </div>
          ))}

          {HOURS.map((h) => (
            <React.Fragment key={h}>
              <div className="schedule-time-label">{h}</div>
              {days.map((d) => {
                const iso = dayIso(d);
                const cs = cellSlots(iso, h);
                return (
                  <div
                    key={iso + h}
                    className={"schedule-cell" + (cs.length === 0 && editable ? " is-empty" : "")}
                    onClick={() => { if (cs.length === 0 && editable) openAdd(iso, h); }}
                  >
                    {cs.map((sl) => {
                      const t = teachersById ? teachersById[sl.teacherId] : null;
                      const who = sl.status === "available" ? (sl.type === "trial" ? "Пробный" : "Свободно") : (studentsFor(sl.teacherId).find((s) => s.id === sl.studentId)?.name || sl.trialName || "—");
                      return (
                        <button
                          key={sl.id}
                          className={"schedule-chip status-" + sl.status}
                          onClick={(e) => { e.stopPropagation(); setAddingCell(null); setSelectedSlotId(sl.id); }}
                        >
                          <span className="chip-time">{sl.time}</span>
                          <span className="chip-info">{t ? t.name.split(" ")[0] + " · " : ""}{who}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {addingCell && (
        <div className="add-panel schedule-add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <strong>{formatDate(addingCell.date)}</strong>
            <button className="btn-icon" onClick={() => setAddingCell(null)} title="Закрыть"><X size={14} /></button>
          </div>
          {teacherOptions && (
            <select className="mini-select" value={addForm.teacherId} onChange={(e) => setAddForm({ ...addForm, teacherId: e.target.value })}>
              {teacherOptions.map((t) => <option key={t.id} value={t.id}>{t.name} — {SUBJECTS[t.subject].label}</option>)}
            </select>
          )}
          <div className="row-gap">
            <span className="hint-text">Время:</span>
            <select className="mini-select" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}>
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="mini-select" value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: Number(e.target.value) })}>
              <option value={30}>30 мин</option><option value={45}>45 мин</option><option value={60}>60 мин</option><option value={90}>90 мин</option>
            </select>
            <select className="mini-select" value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}>
              <option value="trial">Пробный урок</option><option value="regular">Обычный урок</option>
            </select>
          </div>
          <div className="row-gap">
            <span className="hint-text">Ученик:</span>
            <select className="mini-select" value={addForm.studentId} onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value, trialName: e.target.value ? "" : addForm.trialName })}>
              <option value="">Не назначать — свободный слот</option>
              {studentsFor(addForm.teacherId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {!addForm.studentId && addForm.type === "trial" && (
            <input
              className="mini-input wide"
              placeholder="Имя записавшегося на пробный (если его ещё нет в системе)"
              value={addForm.trialName}
              onChange={(e) => setAddForm({ ...addForm, trialName: e.target.value })}
            />
          )}
          <div className="row-gap">
            <button className="btn-small accent" disabled={!addForm.teacherId} onClick={submitAdd}><Check size={12} /> Назначить урок</button>
            <button className="btn-small" onClick={() => setAddingCell(null)}>Отмена</button>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="schedule-detail">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="field-label" style={{ margin: 0 }}>Детали занятия</span>
            <button className="btn-icon" onClick={() => setSelectedSlotId(null)} title="Закрыть"><X size={14} /></button>
          </div>
          <SlotRow
            slot={selectedSlot}
            students={studentsFor(selectedSlot.teacherId)}
            readOnly={!editable}
            teacherLabel={teachersById ? teachersById[selectedSlot.teacherId]?.name : undefined}
            onAssign={actions.assignSlot}
            onCancel={(id) => { actions.cancelSlot(id); setSelectedSlotId(null); }}
            onReschedule={actions.rescheduleSlot}
            onResolveRequest={actions.resolveRequest}
            onRequestReschedule={mode === "student" ? actions.requestReschedule : undefined}
            onAddSlotTopic={actions.addSlotTopic}
            onRemoveSlotTopic={actions.removeSlotTopic}
            onSetSlotMaterial={actions.setSlotMaterial}
            onTogglePaid={actions.toggleSlotPaid}
            onSetMeetingLink={actions.setMeetingLink}
            onSetSlotPaymentLink={actions.setSlotPaymentLink}
            onPayForSlot={mode === "student" ? actions.payForSlot : undefined}
            onConfirmPayment={actions.confirmPayment}
            onDismissPaymentRequest={actions.dismissPaymentRequest}
            onEditDetails={editable ? actions.updateSlotDetails : undefined}
            products={products}
            teachers={allTeachers}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------- package tracker --------------------------- */

function PackageTracker({ student, actions, canEdit, products, slots, subject }) {
  const today = isoDate(0);
  const usedCount = (slots || []).filter((sl) =>
    sl.studentId === student.id && sl.type === "regular" && sl.status !== "cancelled" && sl.date < today &&
    (!student.packageAssignedAt || sl.date >= student.packageAssignedAt)
  ).length;
  const remaining = student.packageTotal ? Math.max(0, student.packageTotal - usedCount) : null;
  const displayLabel = student.packageLabel || (student.packageTotal ? "Пакет на " + student.packageTotal + " занятий" : "");
  const [expanded, setExpanded] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState(student.packageLabel || "");
  const [customCount, setCustomCount] = useState(student.packageTotal || "");

  function pickStandard(count) {
    setCustomOpen(false);
    const match = (products || []).find((p) => p.subject === subject && p.lessonsIncluded === count);
    actions.setPackagePlan(student.id, {
      packageProductId: match ? match.id : null,
      packageTotal: count,
      packageLabel: "Пакет на " + count + " занятий",
    });
    setExpanded(false);
  }

  function pickIndividual() {
    setCustomOpen(false);
    actions.setPackagePlan(student.id, { packageProductId: null, packageTotal: null, packageLabel: "" });
    setExpanded(false);
  }

  function saveCustom() {
    actions.setPackagePlan(student.id, {
      packageProductId: null,
      packageTotal: customCount === "" ? null : Number(customCount),
      packageLabel: customLabel.trim() || (customCount ? "Пакет на " + customCount + " занятий" : ""),
    });
    setCustomOpen(false);
    setExpanded(false);
  }

  if (!canEdit && !student.packageTotal) return null;

  const isIndividual = !student.packageTotal;
  const is5 = student.packageTotal === 5 && student.packageLabel === "Пакет на 5 занятий";
  const is10 = student.packageTotal === 10 && student.packageLabel === "Пакет на 10 занятий";
  const isCustomActive = student.packageTotal && !is5 && !is10 && !isIndividual;

  return (
    <div className="package-widget">
      <button className={"package-badge" + (!canEdit ? " readonly" : "")} onClick={() => canEdit && setExpanded((v) => !v)} disabled={!canEdit}>
        <span>📦 {student.packageTotal ? displayLabel : "Индивидуальный план"}</span>
        {student.packageTotal !== null && student.packageTotal !== undefined && student.packageTotal > 0 && (
          <span className="package-badge-remaining">{remaining}/{student.packageTotal}</span>
        )}
        {canEdit && <span className={"package-chevron" + (expanded ? " open" : "")}>›</span>}
      </button>

      {!!student.packageTotal && (
        <div className="progress-track package-mini-progress">
          <div className="progress-fill" style={{ width: Math.round((usedCount / student.packageTotal) * 100) + "%" }} />
        </div>
      )}

      {canEdit && expanded && (
        <div className="package-expand-panel">
          <div className="package-quick-picks">
            <button className={"btn-small" + (isIndividual ? " accent" : "")} onClick={pickIndividual}>Индивидуальный план</button>
            <button className={"btn-small" + (is5 ? " accent" : "")} onClick={() => pickStandard(5)}>Пакет на 5 занятий</button>
            <button className={"btn-small" + (is10 ? " accent" : "")} onClick={() => pickStandard(10)}>Пакет на 10 занятий</button>
            <button className={"btn-small" + (customOpen || isCustomActive ? " accent" : "")} onClick={() => setCustomOpen((v) => !v)}>Свой вариант</button>
          </div>
          {customOpen && (
            <div className="row-gap" style={{ marginTop: 6 }}>
              <input className="mini-input wide" placeholder="Название плана (например «Пакет на 8 занятий»)" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
              <input type="number" min="0" className="mini-input" style={{ width: 70 }} placeholder="Занятий" value={customCount} onChange={(e) => setCustomCount(e.target.value)} />
              <button className="btn-icon" onClick={saveCustom}><Check size={14} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- checkpoints panel -------------------------- */

function CheckpointsPanel({ student, actions, canEdit }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", maxScore: "", achievedScore: "", note: "" });
  const items = student.checkpoints || [];

  return (
    <div>
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <div className="field-label" style={{ margin: 0 }}>Проверка пройденного</div>
        {canEdit && <button className="btn-icon" onClick={() => setShowAdd((v) => !v)}><Plus size={13} /></button>}
      </div>

      {showAdd && canEdit && (
        <div className="add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="hint-text">Новая проверка / тест</span>
            <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          <input className="mini-input wide" placeholder="Название (напр. IELTS Mock Test)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="row-gap">
            <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Из скольки" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
            <span className="hint-text">из</span>
            <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Набрал(а)" value={form.achievedScore} onChange={(e) => setForm({ ...form, achievedScore: e.target.value })} />
          </div>
          <input className="mini-input wide" placeholder="Комментарий (необязательно)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button
            className="btn-small accent"
            disabled={!form.title.trim() || !form.maxScore || form.achievedScore === ""}
            onClick={() => { actions.addCheckpoint(student.id, form); setForm({ title: "", maxScore: "", achievedScore: "", note: "" }); setShowAdd(false); }}
          ><Check size={12} /> Добавить результат</button>
        </div>
      )}

      {items.length === 0 && <div className="muted-text">Проверок пока не было</div>}
      <div className="checkpoint-list">
        {items.map((c) => {
          const pct = c.maxScore ? Math.round((c.achievedScore / c.maxScore) * 100) : 0;
          return (
            <div key={c.id} className="checkpoint-item">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <strong>{c.title}</strong>
                {canEdit && <button className="topic-remove" onClick={() => actions.removeCheckpoint(student.id, c.id)}><X size={12} /></button>}
              </div>
              <div className="row-gap">
                <span className="checkpoint-score">{c.achievedScore} / {c.maxScore}</span>
                <ProgressBar value={pct} />
              </div>
              {c.note && <div className="hint-text">{c.note}</div>}
              <div className="hint-text">{formatDate(c.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------- teacher-change request (admin) ------------------- */

function TeacherChangeRequestAdmin({ student, teachers, actions }) {
  const [pickTeacherId, setPickTeacherId] = useState("");
  const currentTeacher = teachers.find((t) => t.id === student.teacherId);
  const sameSubjectTeachers = teachers.filter((t) => t.subject === currentTeacher?.subject && t.id !== student.teacherId);

  return (
    <div>
      <div className="field-label">Смена учителя</div>
      <label className="row-gap" style={{ fontSize: 12.5, marginBottom: 6 }}>
        <input type="checkbox" checked={!!student.canRequestTeacherChange} onChange={() => actions.toggleCanRequestTeacherChange(student.id)} />
        Разрешить ученику отправить запрос на смену учителя
      </label>

      {student.teacherChangeRequest && (
        <div className="add-panel">
          <div className="hint-text">Ученик запросил смену учителя {formatDateTime(student.teacherChangeRequest.at)}{student.teacherChangeRequest.note ? ": «" + student.teacherChangeRequest.note + "»" : ""}</div>
          <div className="row-gap">
            <select className="mini-select" value={pickTeacherId} onChange={(e) => setPickTeacherId(e.target.value)}>
              <option value="">Выбрать нового учителя…</option>
              {sameSubjectTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn-small accent" disabled={!pickTeacherId} onClick={() => { actions.reassignStudentTeacher(student.id, pickTeacherId); setPickTeacherId(""); }}>Перевести</button>
            <button className="btn-small" onClick={() => actions.dismissTeacherChangeRequest(student.id)}>Отклонить запрос</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- page customizer ---------------------------- */

const STICKER_CHOICES = ["⭐", "🏆", "🔥", "🎯", "📚", "🎓", "💪", "🌟", "✅", "❤️"];
const BANNER_COLORS = ["", "#F3E6C6", "#E8E1F2", "#DCEEF5", "#F5DCDC", "#DCEDEC", "#F3E1D6"];

function PageCustomizer({ theme, onUpdate }) {
  const t = theme || { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] };
  const [busy, setBusy] = useState(false);

  function toggleSticker(s) {
    const has = (t.stickers || []).includes(s);
    const next = has ? t.stickers.filter((x) => x !== s) : [...(t.stickers || []), s];
    onUpdate({ ...t, stickers: next });
  }

  async function handleBannerFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES * 2) { alert("Изображение слишком большое (максимум ~3 МБ)."); return; }
    setBusy(true);
    try {
      const url = await fileToDataURL(file);
      onUpdate({ ...t, bannerImage: url });
    } catch (err) { console.error(err); }
    setBusy(false);
  }

  return (
    <div>
      <div className="field-label">Оформление страницы</div>
      <div className="hint-text" style={{ marginBottom: 6 }}>Баннер (цвет, картинка), эмодзи и наклейки</div>

      <div className="row-gap" style={{ marginBottom: 8 }}>
        {BANNER_COLORS.map((c, i) => (
          <button
            key={i}
            className={"color-swatch" + (t.bannerColor === c && !t.bannerImage ? " selected" : "")}
            style={{ background: c || "repeating-linear-gradient(45deg, #ddd, #ddd 4px, #fff 4px, #fff 8px)" }}
            onClick={() => onUpdate({ ...t, bannerColor: c, bannerImage: "" })}
            title={c || "без баннера"}
          />
        ))}
        <input
          type="color"
          className="color-picker-native"
          value={t.bannerColor && t.bannerColor.startsWith("#") ? t.bannerColor : "#e8e1f2"}
          onChange={(e) => onUpdate({ ...t, bannerColor: e.target.value, bannerImage: "" })}
          title="Свой цвет"
        />
      </div>

      <div className="row-gap" style={{ marginBottom: 8 }}>
        <label className="btn-small">
          <Paperclip size={11} /> {busy ? "Загрузка…" : "Загрузить картинку баннера"}
          <input type="file" accept="image/*" onChange={handleBannerFile} style={{ display: "none" }} />
        </label>
        {t.bannerImage && <button className="btn-small" onClick={() => onUpdate({ ...t, bannerImage: "" })}>Убрать картинку</button>}
      </div>

      <input
        className="mini-input wide"
        placeholder="Эмодзи для баннера (например 🚀)"
        value={t.bannerEmoji || ""}
        onChange={(e) => onUpdate({ ...t, bannerEmoji: e.target.value })}
        style={{ marginBottom: 8 }}
      />

      <div className="hint-text" style={{ marginBottom: 4 }}>Наклейки:</div>
      <div className="row-gap">
        {STICKER_CHOICES.map((s) => (
          <button key={s} className={"sticker-choice" + ((t.stickers || []).includes(s) ? " active" : "")} onClick={() => toggleSticker(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}


function PageBanner({ theme }) {
  if (!theme) return null;
  const hasBanner = theme.bannerColor || theme.bannerImage || theme.bannerEmoji;
  const hasStickers = theme.stickers && theme.stickers.length > 0;
  if (!hasBanner && !hasStickers) return null;
  const style = theme.bannerImage
    ? { backgroundImage: "url(" + theme.bannerImage + ")", backgroundSize: "cover", backgroundPosition: "center" }
    : { background: theme.bannerColor || "var(--accent-soft)" };
  return (
    <div className="student-banner" style={style}>
      {theme.bannerEmoji && <span className="student-banner-emoji">{theme.bannerEmoji}</span>}
      {hasStickers && (
        <div className="student-banner-stickers">
          {theme.stickers.map((s, i) => <span key={i} className="student-sticker">{s}</span>)}
        </div>
      )}
    </div>
  );
}

function ChangeTeacherRequest({ student, actions }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (student.teacherChangeRequest) {
    return (
      <div className="add-panel">
        <div className="field-label" style={{ margin: 0 }}>Смена учителя</div>
        <div className="hint-text">Запрос отправлен администратору {formatDateTime(student.teacherChangeRequest.at)}. Ожидайте ответа.</div>
      </div>
    );
  }

  return (
    <div className="add-panel">
      <div className="field-label" style={{ margin: 0 }}>Сменить учителя</div>
      {!sent ? (
        <>
          <textarea className="mini-textarea" placeholder="Коротко опишите причину (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-small accent" onClick={() => { actions.requestTeacherChange(student.id, note.trim()); setSent(true); }}>Отправить запрос администратору</button>
        </>
      ) : (
        <div className="hint-text">Запрос отправлен.</div>
      )}
    </div>
  );
}

function GoalPanel({ student, subject, canEdit, actions }) {
  const isExam = !!(student.examTarget && student.examTarget.exam);
  const examOptions = EXAM_OPTIONS[subject] || [];
  const grammarBank = isExam ? (EXAM_GRAMMAR_BANK[student.examTarget.exam] || []) : [];
  const vocabBank = isExam ? (EXAM_VOCAB_BANK[student.examTarget.exam] || []) : [];
  const taskBank = isExam ? (EXAM_TASK_BANK[student.examTarget.exam] || []) : [];

  if (!canEdit && !isExam) return null;

  return (
    <div>
      <div className="field-label">Цель обучения</div>
      {canEdit && (
        <div className="goal-type-switch">
          <button className={"btn-small" + (!isExam ? " accent" : "")} onClick={() => actions.setExamTarget(student.id, null)}>Для себя / путешествия / иммиграция</button>
          <button className={"btn-small" + (isExam ? " accent" : "")} onClick={() => actions.setExamTarget(student.id, { exam: examOptions[0], targetScore: "", examDate: "" })}>🎯 Подготовка к экзамену</button>
        </div>
      )}

      {isExam && (
        <div className="exam-goal-box">
          {canEdit ? (
            <div className="row-gap" style={{ marginTop: 8 }}>
              <select className="mini-select" value={student.examTarget.exam} onChange={(e) => actions.setExamTarget(student.id, { ...student.examTarget, exam: e.target.value })}>
                {examOptions.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
              </select>
              <input className="mini-input" style={{ width: 90 }} placeholder="Балл цель" value={student.examTarget.targetScore} onChange={(e) => actions.setExamTarget(student.id, { ...student.examTarget, targetScore: e.target.value })} />
              <input type="date" className="mini-input" value={student.examTarget.examDate} onChange={(e) => actions.setExamTarget(student.id, { ...student.examTarget, examDate: e.target.value })} />
            </div>
          ) : (
            <div className="row-gap" style={{ marginTop: 8 }}>
              <Pill tone="gold">🎯 {student.examTarget.exam}</Pill>
              {student.examTarget.targetScore && <span className="hint-text">цель: {student.examTarget.targetScore}</span>}
              {student.examTarget.examDate && <span className="hint-text">дата: {formatDate(student.examTarget.examDate)}</span>}
            </div>
          )}

          <div className="exam-subblock">
            <TopicSelector
              label={"Грамматика под " + (student.examTarget.targetScore ? "балл " + student.examTarget.targetScore : student.examTarget.exam)}
              options={grammarBank}
              selected={student.examGrammar || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examGrammar", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examGrammar", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examGrammar", id)}
            />
          </div>

          <div className="exam-subblock">
            <TopicSelector
              label="Лексика под цель"
              options={vocabBank}
              selected={student.examVocab || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examVocab", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examVocab", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examVocab", id)}
            />
          </div>

          <div className="exam-subblock">
            <TopicSelector
              label={"Задания формата " + student.examTarget.exam}
              options={taskBank}
              selected={student.examTopics || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examTopics", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examTopics", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examTopics", id)}
            />
          </div>

          <div className="exam-subblock">
            <div className="field-label">Материалы к урокам и ссылки</div>
            <MaterialsList
              items={student.examMaterials || []}
              readOnly={!canEdit}
              onAdd={(title, note, url, file) => actions.addExamMaterial(student.id, title, note, url, file)}
              onRemove={(id) => actions.removeExamMaterial(student.id, id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherView({ teacher, teachers, students, schedule, actions, perm, products }) {
  const myStudents = students.filter((s) => s.teacherId === teacher.id);
  const mySlots = schedule.filter((sl) => sl.teacherId === teacher.id);
  const [tab, setTab] = useState("students");
  const [selectedId, setSelectedId] = useState(myStudents[0]?.id || null);
  const selected = myStudents.find((s) => s.id === selectedId) || myStudents[0] || null;
  const subjMeta = SUBJECTS[teacher.subject];
  const [editingOwnProfile, setEditingOwnProfile] = useState(false);
  const [customizingOwnPage, setCustomizingOwnPage] = useState(false);
  const [deleteStudentArmedId, setDeleteStudentArmedId] = useState(null);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", contact: "", goal: "", startLevel: "", startNote: "" });

  const past = mySlots.filter((sl) => sl.date < isoDate(0)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const grammarOptions = selected ? (GRAMMAR_BANK[teacher.subject]?.[selected.currentLevel] || []) : [];
  const vocabOptions = VOCAB_BANK[teacher.subject] || [];

  return (
    <div className={"subj-" + teacher.subject}>
      <div className="card teacher-profile-header">
        <PageBanner theme={teacher.pageTheme} />
        {editingOwnProfile ? (
          <TeacherEditForm
            teacher={teacher}
            subjects={SUBJECT_ORDER[teacher.department]}
            onCancel={() => setEditingOwnProfile(false)}
            onSave={(form) => { actions.updateTeacher(teacher.id, form); setEditingOwnProfile(false); }}
          />
        ) : (
          <div className="row-gap" style={{ alignItems: "flex-start" }}>
            <Avatar name={teacher.name} photo={teacher.photo} size={56} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>{teacher.name}</h2>
                {perm.profile && (
                  <div className="row-gap">
                    <button className="btn-icon" onClick={() => setCustomizingOwnPage((v) => !v)} title="Оформление страницы">🎨</button>
                    <button className="btn-icon" onClick={() => setEditingOwnProfile(true)} title="Редактировать профиль"><Pencil size={13} /></button>
                  </div>
                )}
              </div>
              <div className="muted-text">{subjMeta.emoji} {subjMeta.label} · {teacher.contact}</div>
              {teacher.bio && <p className="body-text" style={{ marginTop: 6 }}>{teacher.bio}</p>}
              <div className="row-gap" style={{ marginTop: 8 }}>
                <button
                  className={"btn-small availability-toggle " + (teacher.available ? "is-open" : "is-closed")}
                  onClick={() => actions.toggleTeacherAvailability(teacher.id)}
                >
                  {teacher.available ? "Есть места" : "Мест нет"}
                </button>
                {teacher.available && (
                  <input
                    type="number" min="0" className="mini-input" style={{ width: 60 }}
                    placeholder="Кол-во"
                    value={teacher.availableSpots ?? ""}
                    onChange={(e) => actions.setAvailableSpots(teacher.id, e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {perm.profile && customizingOwnPage && !editingOwnProfile && (
          <div className="add-panel" style={{ marginTop: 10 }}>
            <PageCustomizer theme={teacher.pageTheme} onUpdate={(t) => actions.updateTeacher(teacher.id, { pageTheme: t })} />
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={tab === "students" ? "tab active" : "tab"} onClick={() => setTab("students")}><Users size={13} /> Ученики</button>
        <button className={tab === "materials" ? "tab active" : "tab"} onClick={() => setTab("materials")}><BookOpen size={13} /> Материалы</button>
        <button className={tab === "schedule" ? "tab active" : "tab"} onClick={() => setTab("schedule")}><Calendar size={13} /> Расписание</button>
        <button className={tab === "staff" ? "tab active" : "tab"} onClick={() => setTab("staff")}><Building2 size={13} /> Администрация</button>
      </div>

      {tab === "students" && (
        <div className="teacher-layout">
          <div className="col-students">
            <div className="col-header">
              <h3><Users size={16} /> Ученики ({myStudents.length})</h3>
              {perm.profile && <button className="btn-icon" onClick={() => setShowAddStudent((v) => !v)} title="Добавить ученика"><Plus size={16} /></button>}
            </div>

            {showAddStudent && perm.profile && (
              <div className="add-panel">
                <div className="row-gap" style={{ justifyContent: "space-between" }}>
                  <span className="hint-text">Новый ученик</span>
                  <button className="btn-icon" onClick={() => setShowAddStudent(false)} title="Закрыть"><X size={14} /></button>
                </div>
                <input placeholder="Имя ученика" className="mini-input wide" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                <input placeholder="Контакт (телефон/telegram)" className="mini-input wide" value={newStudent.contact} onChange={(e) => setNewStudent({ ...newStudent, contact: e.target.value })} />
                <textarea placeholder="Изначальная цель ученика" className="mini-textarea" value={newStudent.goal} onChange={(e) => setNewStudent({ ...newStudent, goal: e.target.value })} />
                <div className="row-gap">
                  <span className="hint-text">Уровень при входе:</span>
                  <select className="mini-select" value={newStudent.startLevel || firstLevel(teacher.subject)} onChange={(e) => setNewStudent({ ...newStudent, startLevel: e.target.value })}>
                    {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <textarea placeholder="Стартовая точка: что уже умеет, какие пробелы (необязательно)" className="mini-textarea" value={newStudent.startNote} onChange={(e) => setNewStudent({ ...newStudent, startNote: e.target.value })} />
                <div className="row-gap">
                  <button
                    className="btn-small accent"
                    disabled={!newStudent.name.trim()}
                    onClick={() => {
                      const id = actions.addStudent(teacher.id, newStudent);
                      setNewStudent({ name: "", contact: "", goal: "", startLevel: "", startNote: "" });
                      setShowAddStudent(false);
                      setSelectedId(id);
                    }}
                  >
                    <Check size={12} /> Создать личный кабинет
                  </button>
                  <button className="btn-small" onClick={() => setShowAddStudent(false)}>Отмена</button>
                </div>
              </div>
            )}

            <div className="student-list">
              {myStudents.length === 0 && <EmptyState icon={Users} title="Пока нет учеников" hint="Добавьте первого ученика кнопкой выше" />}
              {myStudents.map((s) => (
                <div key={s.id} className={"student-item" + (selectedId === s.id ? " active" : "")}>
                  <div className="student-item-clickable" onClick={() => setSelectedId(s.id)}>
                    <div className="student-item-top">
                      <span className="student-item-name">{s.name}</span>
                      <ChevronRight size={14} />
                    </div>
                    <div className="student-item-meta">
                      <Pill tone={s.status === "active" ? "accent" : s.status === "trial" ? "gold" : "default"}>{STATUS_LABELS[s.status]}</Pill>
                      {s.examTarget?.exam && <Pill tone="gold">🎯 {s.examTarget.exam}</Pill>}
                      <span className="muted-text">{s.currentLevel}</span>
                    </div>
                  </div>
                  {perm.profile && (
                    deleteStudentArmedId === s.id ? (
                      <button className="btn-icon danger student-delete-btn" onClick={() => { actions.deleteStudent(s.id); setDeleteStudentArmedId(null); if (selectedId === s.id) setSelectedId(null); }} title="Подтвердить удаление"><Check size={12} /></button>
                    ) : (
                      <button className="btn-icon danger student-delete-btn" onClick={() => setDeleteStudentArmedId(s.id)} title="Удалить ученика"><Trash2 size={12} /></button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-main">
            {!selected && <EmptyState icon={GraduationCap} title="Выберите ученика слева" hint="Здесь появится его личный кабинет" />}

            {selected && (
              <>
                <div className="card">
                  <PageBanner theme={selected.pageTheme} />
                  <div className="card-head">
                    <div>
                      <h2>{selected.name}</h2>
                      <div className="muted-text">{selected.contact || "контакт не указан"}</div>
                    </div>
                    {perm.profile ? (
                      <select className="mini-select" value={selected.status} onChange={(e) => actions.updateStudent(selected.id, { status: e.target.value })}>
                        {Object.keys(STATUS_LABELS).map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                      </select>
                    ) : (
                      <Pill tone={selected.status === "active" ? "accent" : "default"}>{STATUS_LABELS[selected.status]}</Pill>
                    )}
                  </div>

                  {perm.profile ? (
                    <select className="mini-select" value={selected.planType || "individual"} onChange={(e) => actions.updateStudent(selected.id, { planType: e.target.value })}>
                      {Object.keys(PLAN_LABELS).map((k) => <option key={k} value={k}>{PLAN_LABELS[k]}</option>)}
                    </select>
                  ) : (
                    <Pill tone={selected.planType === "package" ? "teal" : "default"}>{PLAN_LABELS[selected.planType || "individual"]}</Pill>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <PackageTracker student={selected} actions={actions} canEdit={perm.package} products={products} slots={mySlots} subject={teacher.subject} />
                  </div>

                  <div className="field-block">
                    <div className="field-label">Уровень: старт → текущий</div>
                    <LevelLadder levels={subjMeta.levels} start={selected.startLevel} current={selected.currentLevel} />
                    {perm.profile && (
                      <div className="row-gap" style={{ marginTop: 8 }}>
                        <select className="mini-select" value={selected.startLevel} onChange={(e) => actions.updateStudent(selected.id, { startLevel: e.target.value })}>
                          {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="hint-text">старт</span>
                        <select className="mini-select" value={selected.currentLevel} onChange={(e) => actions.updateStudent(selected.id, { currentLevel: e.target.value })}>
                          {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="hint-text">текущий</span>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <div className="hint-text">Стартовая точка (что умеет / пробелы):</div>
                      {perm.profile ? (
                        <textarea className="mini-textarea" value={selected.startNote || ""} onChange={(e) => actions.updateStudent(selected.id, { startNote: e.target.value })} />
                      ) : (
                        <p className="body-text">{selected.startNote || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div className="field-block">
                    <div className="field-label">Изначальная цель</div>
                    {perm.profile ? (
                      <textarea className="mini-textarea" value={selected.goal} onChange={(e) => actions.updateStudent(selected.id, { goal: e.target.value })} />
                    ) : (
                      <p className="body-text">{selected.goal || "—"}</p>
                    )}
                  </div>

                  <div className="field-block">
                    <GoalPanel student={selected} subject={teacher.subject} canEdit={perm.profile} actions={actions} />
                  </div>

                  <div className="field-block">
                    <div className="field-label">Прогресс</div>
                    <ProgressBar value={progressOf(selected)} />
                    <ProgressBreakdown student={selected} subjMeta={subjMeta} />
                  </div>

                  <div className="field-block">
                    <CheckpointsPanel student={selected} actions={actions} canEdit={perm.profile} />
                  </div>

                  <LessonPlanTimeline slots={mySlots.filter((sl) => sl.studentId === selected.id)} />

                  {!perm.profile && (
                    <div className="field-block">
                      <TeacherChangeRequestAdmin student={selected} teachers={teachers} actions={actions} />
                    </div>
                  )}

                  <div className="field-block">
                    <TopicSelector
                      label={subjMeta.grammarLabel} options={grammarOptions} selected={selected.grammarTopics} readOnly={!perm.profile}
                      onAdd={(name) => actions.addTopic(selected.id, "grammarTopics", name)}
                      onRemove={(id) => actions.removeTopic(selected.id, "grammarTopics", id)}
                      onCycle={(id) => actions.cycleTopicStatus(selected.id, "grammarTopics", id)}
                    />
                  </div>

                  <div className="field-block">
                    <TopicSelector
                      label={subjMeta.vocabLabel} options={vocabOptions} selected={selected.vocabTopics} readOnly={!perm.profile}
                      onAdd={(name) => actions.addTopic(selected.id, "vocabTopics", name)}
                      onRemove={(id) => actions.removeTopic(selected.id, "vocabTopics", id)}
                      onCycle={(id) => actions.cycleTopicStatus(selected.id, "vocabTopics", id)}
                    />
                  </div>

                  {perm.profile && (
                    <div className="field-block">
                      <PageCustomizer theme={selected.pageTheme} onUpdate={(t) => actions.updatePageTheme(selected.id, t)} />
                    </div>
                  )}
                </div>

                <div className="card">
                  <HomeworkPanel key={selected.id} student={selected} actions={actions} role="teacher" canAct={perm.profile} />
                </div>

                <div className="card">
                  <MessagePanel key={selected.id} student={selected} actions={actions} role="teacher" canAct={perm.profile} teacherName={teacher.name} teacherPhoto={teacher.photo} studentName={selected.name} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "materials" && (
        <div className="card">
          <h3><BookOpen size={16} /> Материалы по ученикам</h3>
          <div className="muted-text" style={{ marginBottom: 10 }}>Какие учебники и материалы используются с каждым учеником</div>
          {myStudents.length === 0 && <EmptyState icon={BookOpen} title="Пока нет учеников" />}
          {myStudents.map((s) => (
            <div key={s.id} className="materials-block">
              <div className="materials-block-head">
                <strong>{s.name}</strong>
                <Pill tone={s.status === "active" ? "accent" : "gold"}>{s.currentLevel}</Pill>
              </div>
              <MaterialsList
                items={s.materials || []}
                readOnly={!perm.profile}
                onAdd={(title, note) => actions.addMaterial(s.id, title, note)}
                onRemove={(id) => actions.removeMaterial(s.id, id)}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "schedule" && (
        <div className="card">
          <ScheduleTable slots={mySlots} students={myStudents} teacherId={teacher.id} editable={perm.schedule} actions={actions} mode="teacher" />
          <PastLessonsSection count={past.length}>
            {past.slice(0, 8).map((sl) => (
              <PastLessonCard
                key={sl.id} slot={sl} students={myStudents} editable={perm.schedule}
                onAddSlotTopic={actions.addSlotTopic} onRemoveSlotTopic={actions.removeSlotTopic} onSetSlotMaterial={actions.setSlotMaterial}
              />
            ))}
          </PastLessonsSection>
        </div>
      )}

      {tab === "staff" && (
        <div className="card">
          <div className="field-label">Связь с администрацией</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Рабочие вопросы, зарплата, расписание — сюда.</div>
          <SimpleChatPanel
            messages={teacher.staffMessages}
            onSend={(text, att) => actions.sendStaffMessage(teacher.id, perm.profile ? "teacher" : "admin", text, att)}
            onToggleReaction={(id, emoji) => actions.toggleStaffReaction(teacher.id, id, perm.profile ? "teacher" : "admin", emoji)}
            role={perm.profile ? "teacher" : "admin"} canAct={true}
            selfName={perm.profile ? teacher.name : "Администрация"} selfPhoto={perm.profile ? teacher.photo : ""}
            otherName={perm.profile ? "Администрация" : teacher.name} otherPhoto={perm.profile ? "" : teacher.photo}
            placeholder={perm.profile ? "Написать администрации…" : "Ответить учителю…"}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------- student view ---------------------------- */

function StudentView({ student, teacher, schedule, actions, products }) {
  const subjMeta = SUBJECTS[teacher.subject];
  const [tab, setTab] = useState("profile");
  const mySlots = schedule.filter((sl) => sl.studentId === student.id);
  const past = mySlots.filter((sl) => sl.date < isoDate(0)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <div className={"subj-" + teacher.subject}>
      <div className="tabs">
        <button className={tab === "profile" ? "tab active" : "tab"} onClick={() => setTab("profile")}><GraduationCap size={13} /> Профиль</button>
        <button className={tab === "schedule" ? "tab active" : "tab"} onClick={() => setTab("schedule")}><Calendar size={13} /> Расписание</button>
        <button className={tab === "homework" ? "tab active" : "tab"} onClick={() => setTab("homework")}><BookOpen size={13} /> Домашние задания</button>
        <button className={tab === "chat" ? "tab active" : "tab"} onClick={() => setTab("chat")}><MessageCircle size={13} /> Переписка</button>
        <button className={tab === "support" ? "tab active" : "tab"} onClick={() => setTab("support")}><LifeBuoy size={13} /> Поддержка</button>
      </div>

      {tab === "profile" && (
        <div className="card">
          <PageBanner theme={student.pageTheme} />
          <div className="card-head">
            <div>
              <h2>{student.name}</h2>
              <div className="muted-text">{student.contact || "контакт не указан"}</div>
            </div>
            <div className="row-gap">
              <Pill tone={student.status === "active" ? "accent" : "gold"}>{STATUS_LABELS[student.status]}</Pill>
              <Pill tone={student.planType === "package" ? "teal" : "default"}>{PLAN_LABELS[student.planType || "individual"]}</Pill>
            </div>
          </div>

          <div className="field-block">
            <div className="field-label">Ваш учитель</div>
            <div className="teacher-mini-card">
              <Avatar name={teacher.name} photo={teacher.photo} size={44} />
              <div>
                <div style={{ fontWeight: 700 }}>{teacher.name}</div>
                <div className="muted-text">{subjMeta.emoji} {subjMeta.label} · {teacher.contact}</div>
                {teacher.bio && <p className="body-text" style={{ marginTop: 4 }}>{teacher.bio}</p>}
              </div>
            </div>
          </div>

          <div className="field-block">
            <PackageTracker student={student} actions={actions} canEdit={false} products={products} slots={mySlots} subject={teacher.subject} />
          </div>

          <div className="field-block">
            <div className="field-label">Уровень: старт → текущий</div>
            <LevelLadder levels={subjMeta.levels} start={student.startLevel} current={student.currentLevel} />
            {student.startNote && <p className="body-text" style={{ marginTop: 6 }}>{student.startNote}</p>}
          </div>

          <div className="field-block">
            <div className="field-label">Изначальная цель</div>
            <p className="body-text">{student.goal || "—"}</p>
          </div>

          {student.examTarget?.exam && (
            <div className="field-block">
              <GoalPanel student={student} subject={teacher.subject} canEdit={false} actions={actions} />
            </div>
          )}

          <div className="field-block">
            <div className="field-label">Прогресс</div>
            <ProgressBar value={progressOf(student)} />
            <ProgressBreakdown student={student} subjMeta={subjMeta} />
          </div>

          <div className="field-block">
            <CheckpointsPanel student={student} actions={actions} canEdit={false} />
          </div>

          <div className="field-block">
            <TopicSelector label={subjMeta.grammarLabel} options={[]} selected={student.grammarTopics} readOnly={true} onAdd={() => {}} onRemove={() => {}} onCycle={() => {}} />
          </div>
          <div className="field-block">
            <TopicSelector label={subjMeta.vocabLabel} options={[]} selected={student.vocabTopics} readOnly={true} onAdd={() => {}} onRemove={() => {}} onCycle={() => {}} />
          </div>

          {student.canRequestTeacherChange && (
            <div className="field-block">
              <ChangeTeacherRequest student={student} actions={actions} />
            </div>
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div className="card">
          <ScheduleTable slots={mySlots} students={[student]} teacherId={teacher.id} editable={false} actions={actions} mode="student" products={products} allTeachers={[teacher]} />
          <LessonPlanTimeline slots={mySlots} />
          <PastLessonsSection count={past.length}>
            {past.slice(0, 8).map((sl) => <PastLessonCard key={sl.id} slot={sl} students={[student]} editable={false} />)}
          </PastLessonsSection>
        </div>
      )}

      {tab === "homework" && (
        <div className="card">
          <HomeworkPanel student={student} actions={actions} role="student" canAct={true} />
        </div>
      )}

      {tab === "chat" && (
        <div className="card">
          <MessagePanel student={student} actions={actions} role="student" canAct={true} teacherName={teacher.name} teacherPhoto={teacher.photo} studentName={student.name} />
        </div>
      )}

      {tab === "support" && (
        <div className="card">
          <div className="field-label">Связь с администрацией</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Вопросы по оплате, расписанию или смене учителя — сюда.</div>
          <SimpleChatPanel
            messages={student.supportMessages}
            onSend={(text, att) => actions.sendSupportMessage(student.id, "student", text, att)}
            onToggleReaction={(id, emoji) => actions.toggleSupportReaction(student.id, id, "student", emoji)}
            role="student" canAct={true}
            selfName={student.name} selfPhoto=""
            otherName="Администрация" otherPhoto=""
            placeholder="Написать администрации…"
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------- teacher edit form ------------------------- */

function TeacherEditForm({ teacher, subjects, onSave, onCancel, products, actions, showPayoutRates }) {
  const [form, setForm] = useState({ name: teacher.name, contact: teacher.contact, subject: teacher.subject, bio: teacher.bio || "", photo: teacher.photo || "" });
  const [busy, setBusy] = useState(false);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataURL(file);
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) { console.error(err); }
    setBusy(false);
  }

  return (
    <div className="add-panel">
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <span className="hint-text">Редактирование учителя</span>
        <button className="btn-icon" onClick={onCancel} title="Закрыть"><X size={14} /></button>
      </div>
      <div className="row-gap">
        <Avatar name={form.name} photo={form.photo} size={48} />
        <label className="btn-small">
          <Paperclip size={12} /> {busy ? "Загрузка…" : "Загрузить фото"}
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        </label>
        {form.photo && <button className="btn-small" onClick={() => setForm({ ...form, photo: "" })}>Убрать фото</button>}
      </div>
      <input className="mini-input wide" placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="mini-input wide" placeholder="Контакт" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
      <select className="mini-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
        {subjects.map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].label}</option>)}
      </select>
      <textarea className="mini-textarea" placeholder="Краткая информация об учителе" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <div className="row-gap">
        <button className="btn-small accent" disabled={!form.name.trim()} onClick={() => onSave(form)}><Check size={12} /> Сохранить</button>
        <button className="btn-small" onClick={onCancel}>Отмена</button>
      </div>

      {showPayoutRates && (
        <div className="payout-rates-block">
          <div className="field-label">Ставки за уроки (зарплата с продажи)</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Сколько этот учитель получает с каждой продажи конкретного товара. Если не задано — используется базовая ставка товара.</div>
          <div className="payout-rates-table">
            {products.map((p) => {
              const override = teacher.payoutOverrides && teacher.payoutOverrides[p.id];
              const value = override !== undefined ? override : "";
              return (
                <div key={p.id} className="payout-rate-row">
                  <span>{p.name}</span>
                  <input
                    type="number" className="mini-input" style={{ width: 90 }}
                    placeholder={"база: " + fmtMoney(p.payoutPerUnit || 0)}
                    value={value}
                    onChange={(e) => actions.setTeacherPayoutRate(teacher.id, p.id, e.target.value === "" ? null : e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- admin view ------------------------------ */

function AdminView({ department, teachers, students, schedule, sales, products, discountPercent, expenses, actions }) {
  const [tab, setTab] = useState("teachers");
  const [detailTeacherId, setDetailTeacherId] = useState(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const deptSubjects = SUBJECT_ORDER[department];
  const [newTeacher, setNewTeacher] = useState({ name: "", contact: "", subject: deptSubjects[0] });
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [deleteArmedId, setDeleteArmedId] = useState(null);

  const deptTeachers = teachers.filter((t) => t.department === department);
  const deptStudentsAll = students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId));

  const unreadSupport = deptStudentsAll.filter((s) => (s.supportMessages || []).length > 0 && s.supportMessages[s.supportMessages.length - 1].sender === "student");
  const unreadStaff = deptTeachers.filter((t) => (t.staffMessages || []).length > 0 && t.staffMessages[t.staffMessages.length - 1].sender === "teacher");
  const unreadTotal = unreadSupport.length + unreadStaff.length;

  const [showAddStudentRoster, setShowAddStudentRoster] = useState(false);
  const [rosterForm, setRosterForm] = useState({ teacherId: deptTeachers[0]?.id || "", name: "", contact: "", goal: "" });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [chattingStudentId, setChattingStudentId] = useState(null);
  const [studentEditForm, setStudentEditForm] = useState({ name: "", contact: "", goal: "", startLevel: "", currentLevel: "", status: "trial" });
  const [openThread, setOpenThread] = useState(null);

  const detailTeacher = teachers.find((t) => t.id === detailTeacherId);

  if (detailTeacher) {
    return (
      <div>
        <button className="btn-small" onClick={() => setDetailTeacherId(null)} style={{ marginBottom: 12 }}>← Ко всем учителям</button>
        <TeacherView teacher={detailTeacher} teachers={teachers} students={students} schedule={schedule} actions={actions} products={products} perm={{ profile: false, schedule: true, package: true }} />
      </div>
    );
  }

  const totalActive = students.filter((s) => s.status === "active").length;
  const totalActiveLang = students.filter((s) => s.status === "active" && teachers.find((t) => t.id === s.teacherId)?.department === "language").length;
  const totalActiveHum = students.filter((s) => s.status === "active" && teachers.find((t) => t.id === s.teacherId)?.department === "humanities").length;

  return (
    <div>
      <div className="school-stats">
        <div className="school-stat"><div className="school-stat-value">{totalActive}</div><div className="school-stat-label">Активных учеников по школе</div></div>
        <div className="school-stat"><div className="school-stat-value">{totalActiveLang}</div><div className="school-stat-label">Языковое подразделение</div></div>
        <div className="school-stat"><div className="school-stat-value">{totalActiveHum}</div><div className="school-stat-label">Гуманитарное подразделение</div></div>
      </div>

      <div className="tabs">
        <button className={tab === "teachers" ? "tab active" : "tab"} onClick={() => setTab("teachers")}><Users size={13} /> Учителя</button>
        <button className={tab === "schedule" ? "tab active" : "tab"} onClick={() => setTab("schedule")}><Calendar size={13} /> Общее расписание</button>
        <button className={tab === "roster" ? "tab active" : "tab"} onClick={() => setTab("roster")}><GraduationCap size={13} /> Ученики школы</button>
        <button className={tab === "sales" ? "tab active" : "tab"} onClick={() => setTab("sales")}><ShoppingBag size={13} /> Магазин</button>
        <button className={tab === "messages" ? "tab active" : "tab"} onClick={() => setTab("messages")}>
          <Inbox size={13} /> Сообщения{unreadTotal > 0 ? " (" + unreadTotal + ")" : ""}
        </button>
      </div>

      {tab === "teachers" && (
        <div>
          <div className="col-header">
            <h3><Users size={16} /> Учителя — {DEPARTMENTS[department]}</h3>
            <button className="btn-icon" onClick={() => setShowAddTeacher((v) => !v)}><Plus size={16} /></button>
          </div>

          {showAddTeacher && (
            <div className="add-panel">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <span className="hint-text">Новый учитель</span>
                <button className="btn-icon" onClick={() => setShowAddTeacher(false)} title="Закрыть"><X size={14} /></button>
              </div>
              <input placeholder="Имя учителя" className="mini-input wide" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
              <input placeholder="Контакт" className="mini-input wide" value={newTeacher.contact} onChange={(e) => setNewTeacher({ ...newTeacher, contact: e.target.value })} />
              <select className="mini-select" value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}>
                {deptSubjects.map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].label}</option>)}
              </select>
              <div className="row-gap">
                <button
                  className="btn-small accent"
                  disabled={!newTeacher.name.trim()}
                  onClick={() => { actions.addTeacher({ ...newTeacher, department }); setNewTeacher({ name: "", contact: "", subject: deptSubjects[0] }); setShowAddTeacher(false); }}
                >
                  <Check size={12} /> Добавить учителя
                </button>
                <button className="btn-small" onClick={() => setShowAddTeacher(false)}>Отмена</button>
              </div>
            </div>
          )}

          {deptSubjects.map((sub) => {
            const subjTeachers = deptTeachers.filter((t) => t.subject === sub);
            return (
              <div key={sub} className={"subject-group subj-" + sub}>
                <div className="subject-group-title">{SUBJECTS[sub].emoji} {SUBJECTS[sub].label} <span className="muted-text">({subjTeachers.length})</span></div>
                {subjTeachers.length === 0 ? (
                  <div className="muted-text" style={{ marginBottom: 10 }}>Пока нет учителей по этому предмету</div>
                ) : (
                  <div className="teacher-grid">
                    {subjTeachers.map((t) => {
                      const myStudents = students.filter((s) => s.teacherId === t.id);
                      const active = myStudents.filter((s) => s.status === "active").length;
                      const upcomingCount = schedule.filter((sl) => sl.teacherId === t.id && sl.date >= isoDate(0) && sl.status !== "cancelled").length;

                      if (editingTeacherId === t.id) {
                        return (
                          <div key={t.id} className="teacher-card">
                            <TeacherEditForm
                              teacher={t}
                              subjects={deptSubjects}
                              products={products}
                              actions={actions}
                              showPayoutRates={true}
                              onCancel={() => setEditingTeacherId(null)}
                              onSave={(form) => { actions.updateTeacher(t.id, form); setEditingTeacherId(null); }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={t.id} className="teacher-card">
                          <div className="teacher-card-actions">
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingTeacherId(t.id); }} title="Редактировать"><Pencil size={13} /></button>
                            {deleteArmedId === t.id ? (
                              <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); actions.deleteTeacher(t.id); setDeleteArmedId(null); }} title="Подтвердить удаление"><Check size={13} /></button>
                            ) : (
                              <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteArmedId(t.id); }} title="Удалить учителя" disabled={myStudents.length > 0}><Trash2 size={13} /></button>
                            )}
                          </div>
                          <div className="teacher-card-body" onClick={() => setDetailTeacherId(t.id)}>
                            <div className="row-gap" style={{ marginBottom: 6 }}>
                              <Avatar name={t.name} photo={t.photo} size={40} />
                              <div>
                                <div className="teacher-card-name">{t.name}</div>
                                <div className="muted-text">{SUBJECTS[t.subject].emoji} {SUBJECTS[t.subject].label}</div>
                              </div>
                            </div>
                            {t.bio && <div className="teacher-card-bio">{t.bio}</div>}
                            <div className="muted-text">{t.contact}</div>
                            <button
                              className={"btn-small availability-toggle " + (t.available ? "is-open" : "is-closed")}
                              onClick={(e) => { e.stopPropagation(); actions.toggleTeacherAvailability(t.id); }}
                            >
                              {t.available ? "Есть места" + (t.availableSpots ? " (" + t.availableSpots + ")" : "") : "Мест нет"}
                            </button>
                            <div className="teacher-card-stats">
                              <span><Users size={13} /> {active} активных · {myStudents.length} всего</span>
                              <span><Calendar size={13} /> {upcomingCount} предстоящих занятий</span>
                            </div>
                            {myStudents.length > 0 && deleteArmedId === t.id && (
                              <div className="hint-text" style={{ color: "var(--danger)" }}>Нельзя удалить: есть ученики. Сначала переведите их к другому учителю.</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "schedule" && (
        <div className="card">
          <h3><Calendar size={16} /> Общее расписание — {DEPARTMENTS[department]}</h3>
          <div className="muted-text" style={{ marginBottom: 10 }}>Занятия всех учителей подразделения: предмет, ученик, учитель — в одной сетке</div>
          {deptTeachers.length === 0 ? (
            <EmptyState icon={Calendar} title="В этом подразделении пока нет учителей" />
          ) : (
            <ScheduleTable
              slots={schedule.filter((sl) => deptTeachers.some((t) => t.id === sl.teacherId))}
              students={students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId))}
              teacherOptions={deptTeachers}
              teachersById={Object.fromEntries(deptTeachers.map((t) => [t.id, t]))}
              editable={true}
              actions={actions}
              mode="admin"
            />
          )}
        </div>
      )}

      {tab === "roster" && (
        <div>
          <div className="col-header">
            <h3><GraduationCap size={16} /> Ученики школы — {DEPARTMENTS[department]}</h3>
            <button className="btn-icon" onClick={() => setShowAddStudentRoster((v) => !v)} disabled={deptTeachers.length === 0}><Plus size={16} /></button>
          </div>

          {showAddStudentRoster && (
            <div className="add-panel">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <span className="hint-text">Новый ученик</span>
                <button className="btn-icon" onClick={() => setShowAddStudentRoster(false)} title="Закрыть"><X size={14} /></button>
              </div>
              <select className="mini-select" value={rosterForm.teacherId} onChange={(e) => setRosterForm({ ...rosterForm, teacherId: e.target.value })}>
                {deptTeachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {SUBJECTS[t.subject].label}</option>)}
              </select>
              <input placeholder="Имя ученика" className="mini-input wide" value={rosterForm.name} onChange={(e) => setRosterForm({ ...rosterForm, name: e.target.value })} />
              <input placeholder="Контакт" className="mini-input wide" value={rosterForm.contact} onChange={(e) => setRosterForm({ ...rosterForm, contact: e.target.value })} />
              <textarea placeholder="Изначальная цель" className="mini-textarea" value={rosterForm.goal} onChange={(e) => setRosterForm({ ...rosterForm, goal: e.target.value })} />
              <div className="row-gap">
                <button
                  className="btn-small accent"
                  disabled={!rosterForm.name.trim() || !rosterForm.teacherId}
                  onClick={() => { actions.addStudent(rosterForm.teacherId, rosterForm); setRosterForm({ teacherId: deptTeachers[0]?.id || "", name: "", contact: "", goal: "" }); setShowAddStudentRoster(false); }}
                >
                  <Check size={12} /> Создать личный кабинет
                </button>
                <button className="btn-small" onClick={() => setShowAddStudentRoster(false)}>Отмена</button>
              </div>
            </div>
          )}

          {deptSubjects.map((sub) => {
            const subjTeacherIds = deptTeachers.filter((t) => t.subject === sub).map((t) => t.id);
            const subjStudents = students.filter((s) => subjTeacherIds.includes(s.teacherId));
            if (subjStudents.length === 0) return null;
            return (
              <div key={sub} className={"subject-group subj-" + sub}>
                <div className="subject-group-title">{SUBJECTS[sub].emoji} {SUBJECTS[sub].label} <span className="muted-text">({subjStudents.length})</span></div>
                <div className="admin-schedule-table">
                  <div className="admin-schedule-row head roster-row">
                    <span>Ученик</span><span>Учитель</span><span>Уровень</span><span>Пакет</span><span>Статус</span><span>Прогресс</span><span></span>
                  </div>
                  {subjStudents.map((s) => {
                    const t = teachers.find((x) => x.id === s.teacherId);
                    const subjMetaS = SUBJECTS[t?.subject];
                    const hasUnread = (s.supportMessages || []).length > 0 && s.supportMessages[s.supportMessages.length - 1].sender === "student";
                    return (
                      <React.Fragment key={s.id}>
                        <div className="admin-schedule-row roster-row">
                          <span>{s.name}</span>
                          <span>{t ? t.name : "—"}</span>
                          <span>{s.currentLevel}</span>
                          <span>
                            <PackageTracker student={s} actions={actions} canEdit={true} products={products} slots={schedule} subject={t?.subject} />
                          </span>
                          <span><Pill tone={s.status === "active" ? "accent" : "gold"}>{STATUS_LABELS[s.status]}</Pill></span>
                          <span>{progressOf(s)}%</span>
                          <span className="row-gap" style={{ flexWrap: "nowrap" }}>
                            <button
                              className={"btn-icon" + (hasUnread ? " danger" : "")}
                              title="Переписка с учеником (поддержка)"
                              onClick={() => setChattingStudentId(chattingStudentId === s.id ? null : s.id)}
                            >🆘</button>
                            <button
                              className="btn-icon"
                              title="Редактировать ученика"
                              onClick={() => {
                                if (editingStudentId === s.id) { setEditingStudentId(null); return; }
                                setEditingStudentId(s.id);
                                setStudentEditForm({ name: s.name, contact: s.contact, goal: s.goal, startLevel: s.startLevel, currentLevel: s.currentLevel, status: s.status });
                              }}
                            ><Pencil size={12} /></button>
                          </span>
                        </div>
                        {chattingStudentId === s.id && (
                          <div className="admin-schedule-row roster-row" style={{ gridColumn: "1 / -1", display: "block" }}>
                            <div className="add-panel">
                              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                                <span className="hint-text">Поддержка — {s.name}</span>
                                <button className="btn-icon" onClick={() => setChattingStudentId(null)}><X size={14} /></button>
                              </div>
                              <SimpleChatPanel
                                messages={s.supportMessages}
                                onSend={(text, att) => actions.sendSupportMessage(s.id, "admin", text, att)}
                                onToggleReaction={(id, emoji) => actions.toggleSupportReaction(s.id, id, "admin", emoji)}
                                role="admin" canAct={true}
                                selfName="Администрация" selfPhoto=""
                                otherName={s.name} otherPhoto=""
                                placeholder="Ответить ученику…"
                              />
                            </div>
                          </div>
                        )}
                        {editingStudentId === s.id && (
                          <div className="admin-schedule-row roster-row" style={{ gridColumn: "1 / -1", display: "block" }}>
                            <div className="add-panel">
                              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                                <span className="hint-text">Редактирование ученика — {s.name}</span>
                                <button className="btn-icon" onClick={() => setEditingStudentId(null)}><X size={14} /></button>
                              </div>
                              <input className="mini-input wide" placeholder="Имя" value={studentEditForm.name} onChange={(e) => setStudentEditForm({ ...studentEditForm, name: e.target.value })} />
                              <input className="mini-input wide" placeholder="Контакт" value={studentEditForm.contact} onChange={(e) => setStudentEditForm({ ...studentEditForm, contact: e.target.value })} />
                              <textarea className="mini-textarea" placeholder="Изначальная цель" value={studentEditForm.goal} onChange={(e) => setStudentEditForm({ ...studentEditForm, goal: e.target.value })} />
                              {subjMetaS && (
                                <div className="row-gap">
                                  <span className="hint-text">Старт:</span>
                                  <select className="mini-select" value={studentEditForm.startLevel} onChange={(e) => setStudentEditForm({ ...studentEditForm, startLevel: e.target.value })}>
                                    {subjMetaS.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                  <span className="hint-text">Текущий:</span>
                                  <select className="mini-select" value={studentEditForm.currentLevel} onChange={(e) => setStudentEditForm({ ...studentEditForm, currentLevel: e.target.value })}>
                                    {subjMetaS.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                </div>
                              )}
                              <select className="mini-select" value={studentEditForm.status} onChange={(e) => setStudentEditForm({ ...studentEditForm, status: e.target.value })}>
                                {Object.keys(STATUS_LABELS).map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                              </select>
                              <div className="row-gap">
                                <button
                                  className="btn-small accent"
                                  onClick={() => {
                                    actions.updateStudent(s.id, {
                                      name: studentEditForm.name.trim(), contact: studentEditForm.contact.trim(), goal: studentEditForm.goal.trim(),
                                      startLevel: studentEditForm.startLevel, currentLevel: studentEditForm.currentLevel, status: studentEditForm.status,
                                    });
                                    setEditingStudentId(null);
                                  }}
                                ><Check size={12} /> Сохранить</button>
                                <button className="btn-small" onClick={() => setEditingStudentId(null)}>Отмена</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "sales" && <ShopPanel sales={sales} products={products} discountPercent={discountPercent} actions={actions} expenses={expenses} teachers={deptTeachers} students={students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId))} />}

      {tab === "messages" && (
        <div>
          <div className="col-header">
            <h3>💬 Сообщения — {DEPARTMENTS[department]}</h3>
          </div>

          <div className="subject-group">
            <div className="subject-group-title">Обращения учеников (поддержка)</div>
            {deptStudentsAll.length === 0 && <EmptyState icon={MessageCircle} title="В этом подразделении пока нет учеников" />}
            {deptStudentsAll.map((s) => {
              const msgs = s.supportMessages || [];
              const last = msgs[msgs.length - 1];
              const unread = last && last.sender === "student";
              const isOpen = openThread === "support:" + s.id;
              return (
                <div key={s.id} className="thread-row-wrap">
                  <button className={"thread-row" + (unread ? " unread" : "")} onClick={() => setOpenThread(isOpen ? null : "support:" + s.id)}>
                    <Avatar name={s.name} photo="" size={32} />
                    <div className="thread-row-body">
                      <div className="thread-row-name">{s.name} {unread && <span className="thread-dot" />}</div>
                      <div className="thread-row-preview">{last ? (last.text || "📎 вложение") : "Сообщений пока нет"}</div>
                    </div>
                    {last && <div className="thread-row-time">{formatDateTime(last.at)}</div>}
                  </button>
                  {isOpen && (
                    <div className="add-panel">
                      <SimpleChatPanel
                        messages={s.supportMessages}
                        onSend={(text, att) => actions.sendSupportMessage(s.id, "admin", text, att)}
                        onToggleReaction={(id, emoji) => actions.toggleSupportReaction(s.id, id, "admin", emoji)}
                        role="admin" canAct={true}
                        selfName="Администрация" selfPhoto=""
                        otherName={s.name} otherPhoto=""
                        placeholder="Ответить ученику…"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="subject-group">
            <div className="subject-group-title">Сообщения от учителей</div>
            {deptTeachers.length === 0 && <EmptyState icon={MessageCircle} title="В этом подразделении пока нет учителей" />}
            {deptTeachers.map((t) => {
              const msgs = t.staffMessages || [];
              const last = msgs[msgs.length - 1];
              const unread = last && last.sender === "teacher";
              const isOpen = openThread === "staff:" + t.id;
              return (
                <div key={t.id} className="thread-row-wrap">
                  <button className={"thread-row" + (unread ? " unread" : "")} onClick={() => setOpenThread(isOpen ? null : "staff:" + t.id)}>
                    <Avatar name={t.name} photo={t.photo} size={32} />
                    <div className="thread-row-body">
                      <div className="thread-row-name">{t.name} {unread && <span className="thread-dot" />}</div>
                      <div className="thread-row-preview">{last ? (last.text || "📎 вложение") : "Сообщений пока нет"}</div>
                    </div>
                    {last && <div className="thread-row-time">{formatDateTime(last.at)}</div>}
                  </button>
                  {isOpen && (
                    <div className="add-panel">
                      <SimpleChatPanel
                        messages={t.staffMessages}
                        onSend={(text, att) => actions.sendStaffMessage(t.id, "admin", text, att)}
                        onToggleReaction={(id, emoji) => actions.toggleStaffReaction(t.id, id, "admin", emoji)}
                        role="admin" canAct={true}
                        selfName="Администрация" selfPhoto=""
                        otherName={t.name} otherPhoto={t.photo}
                        placeholder="Ответить учителю…"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- sales panel ------------------------------ */

const CHART_COLORS = ["#449999", "#D65655", "#A9791E", "#8B7BB8", "#6FA8C9", "#B2593B", "#C97A2B", "#6B6862"];

function fmtMoney(n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; }

const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function ShopPanel({ sales, products, discountPercent, actions, students, expenses, teachers }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [saleForm, setSaleForm] = useState({ date: isoDate(0), productId: products[0]?.id || "", qty: 1, discounted: false, studentId: "", teacherId: teachers[0]?.id || "" });
  const [productsOpen, setProductsOpen] = useState(false);
  const [showAddProductRow, setShowAddProductRow] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", price: "", department: "language", subject: "english", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" });
  const [discountDraft, setDiscountDraft] = useState(discountPercent);
  const [expenseForm, setExpenseForm] = useState({ date: isoDate(0), category: "Аренда", amount: "", note: "" });
  const [shopTab, setShopTab] = useState("overview");

  function shiftMonth(delta) {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }

  const monthPrefix = viewYear + "-" + String(viewMonth + 1).padStart(2, "0");
  const monthSales = sales.filter((s) => s.date.startsWith(monthPrefix));
  const monthExpenses = (expenses || []).filter((e) => e.date.startsWith(monthPrefix));
  const monthTotal = monthSales.reduce((a, s) => a + s.amount, 0);
  const monthPayouts = monthExpenses.filter((e) => e.auto).reduce((a, e) => a + e.amount, 0);
  const monthOtherExpenses = monthExpenses.filter((e) => !e.auto).reduce((a, e) => a + e.amount, 0);
  const monthExpenseTotal = monthPayouts + monthOtherExpenses;
  const monthProfit = monthTotal - monthExpenseTotal;
  const monthMargin = monthTotal > 0 ? Math.round((monthProfit / monthTotal) * 100) : null;

  const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevPrefix = prevY + "-" + String(prevM + 1).padStart(2, "0");
  const prevTotal = sales.filter((s) => s.date.startsWith(prevPrefix)).reduce((a, s) => a + s.amount, 0);
  const delta = prevTotal > 0 ? Math.round(((monthTotal - prevTotal) / prevTotal) * 100) : null;

  const todayIso = isoDate(0);
  const weekStartIso = localDateStr(mondayOf(new Date()));
  const todayTotal = sales.filter((s) => s.date === todayIso).reduce((a, s) => a + s.amount, 0);
  const weekTotal = sales.filter((s) => s.date >= weekStartIso).reduce((a, s) => a + s.amount, 0);

  const byProduct = products.map((p, i) => ({
    product: p,
    total: monthSales.filter((s) => s.productId === p.id).reduce((a, s) => a + s.amount, 0),
    color: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((x) => x.total > 0);

  let acc = 0;
  const gradientStops = byProduct.map((x) => {
    const start = acc;
    const pct = monthTotal > 0 ? (x.total / monthTotal) * 100 : 0;
    acc += pct;
    return `${x.color} ${start}% ${acc}%`;
  }).join(", ");

  return (
    <div className="card">
      <h3>🛍️ Магазин и продажи</h3>
      <div className="muted-text" style={{ marginBottom: 10 }}>
        Товары и услуги школы, скидка на приветственные пакеты, зарплатные отчисления учителям и статистика по месяцам. Цифры вносятся вручную.
      </div>

      <div className="sales-stats">
        <div className="sales-stat"><div className="sales-stat-label">Сегодня</div><div className="sales-stat-value">{fmtMoney(todayTotal)}</div></div>
        <div className="sales-stat"><div className="sales-stat-label">За неделю</div><div className="sales-stat-value">{fmtMoney(weekTotal)}</div></div>
        <div className="sales-stat"><div className="sales-stat-label">За выбранный месяц</div><div className="sales-stat-value">{fmtMoney(monthTotal)}</div></div>
      </div>

      <div className="month-switch">
        <button className="btn-small" onClick={() => shiftMonth(-1)}>← Пред. месяц</button>
        <strong>{MONTH_NAMES[viewMonth]} {viewYear}</strong>
        <button className="btn-small" onClick={() => shiftMonth(1)}>След. месяц →</button>
        {delta !== null && (
          <Pill tone={delta >= 0 ? "accent" : "danger"}>{delta >= 0 ? "+" : ""}{delta}% к пред. месяцу</Pill>
        )}
      </div>

      <div className="donut-row">
        <div className="donut-chart" style={{ background: byProduct.length ? `conic-gradient(${gradientStops})` : "var(--border)" }}>
          <div className="donut-hole">
            <div className="donut-hole-value">{fmtMoney(monthTotal)}</div>
            <div className="donut-hole-label">за месяц</div>
          </div>
        </div>
        <div className="donut-legend">
          {byProduct.length === 0 && <div className="muted-text">Нет продаж за этот месяц</div>}
          {byProduct.map((x) => (
            <div key={x.product.id} className="donut-legend-row">
              <span className="donut-dot" style={{ background: x.color }} />
              <span className="donut-legend-name">{x.product.name}</span>
              <span className="donut-legend-value">{fmtMoney(x.total)} · {monthTotal > 0 ? Math.round((x.total / monthTotal) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="field-block">
        <div className="field-label">Финансы за {MONTH_NAMES[viewMonth]}</div>
        <div className="finance-grid">
          <div className="finance-cell"><div className="hint-text">Выручка</div><div className="finance-value">{fmtMoney(monthTotal)}</div></div>
          <div className="finance-cell"><div className="hint-text">Зарплата учителям</div><div className="finance-value">− {fmtMoney(monthPayouts)}</div></div>
          <div className="finance-cell"><div className="hint-text">Прочие траты школы</div><div className="finance-value">− {fmtMoney(monthOtherExpenses)}</div></div>
          <div className="finance-cell finance-profit"><div className="hint-text">Чистая прибыль</div><div className="finance-value">{fmtMoney(monthProfit)}</div></div>
          <div className="finance-cell finance-margin"><div className="hint-text">Рентабельность</div><div className="finance-value">{monthMargin === null ? "—" : monthMargin + "%"}</div></div>
        </div>

        <div className="add-panel" style={{ marginTop: 10 }}>
          <div className="hint-text">Новая трата школы (аренда, реклама, хостинг и т.д.)</div>
          <div className="row-gap">
            <input type="date" className="mini-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            <input className="mini-input" placeholder="Категория" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
            <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Сумма" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          </div>
          <input className="mini-input wide" placeholder="Комментарий (необязательно)" value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          <button className="btn-small accent" disabled={!expenseForm.amount} onClick={() => { actions.addExpense(expenseForm.date, expenseForm.category, expenseForm.amount, expenseForm.note); setExpenseForm({ ...expenseForm, amount: "", note: "" }); }}><Check size={12} /> Добавить трату</button>
        </div>

        {monthExpenses.length > 0 && (
          <div className="sales-log" style={{ marginTop: 8 }}>
            {[...monthExpenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <div key={e.id} className="sales-log-row">
                <span>{formatDate(e.date)}</span>
                <span>{e.auto && <Pill tone="gold">авто</Pill>} {e.category}{e.note ? " — " + e.note : ""}</span>
                <span>{fmtMoney(e.amount)}</span>
                <button className="topic-remove" onClick={() => actions.removeExpense(e.id)}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="field-block">
        <button className="products-dropdown-toggle" onClick={() => setProductsOpen((v) => !v)}>
          <span className={"past-chevron" + (productsOpen ? " open" : "")}>›</span>
          <span className="field-label" style={{ margin: 0 }}>Товары и услуги ({products.length})</span>
        </button>

        {productsOpen && (
          <div className="products-dropdown-list">
            <ul className="materials-list">
              {products.map((p) => (
                editingProductId === p.id ? (
                  <li key={p.id} className="product-edit-row">
                    <input className="mini-input wide" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Цена" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Занятий" value={editForm.lessonsIncluded} onChange={(e) => setEditForm({ ...editForm, lessonsIncluded: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Зарплата учителю" value={editForm.payoutPerUnit} onChange={(e) => setEditForm({ ...editForm, payoutPerUnit: e.target.value })} />
                    <input className="mini-input wide" placeholder="Ссылка на оплату в ЮKassa" value={editForm.paymentLink} onChange={(e) => setEditForm({ ...editForm, paymentLink: e.target.value })} />
                    <button className="btn-icon" onClick={() => { actions.updateProduct(p.id, { name: editForm.name.trim(), price: Number(editForm.price) || 0, lessonsIncluded: Number(editForm.lessonsIncluded) || 0, paymentLink: editForm.paymentLink.trim(), payoutPerUnit: Number(editForm.payoutPerUnit) || 0 }); setEditingProductId(null); }}><Check size={12} /></button>
                    <button className="btn-icon" onClick={() => setEditingProductId(null)}><X size={12} /></button>
                  </li>
                ) : (
                  <li key={p.id}>
                    <span><strong>{p.name}</strong> — {fmtMoney(p.price)}{p.lessonsIncluded > 0 ? " · пакет на " + p.lessonsIncluded + " занятий" : ""}{p.payoutPerUnit > 0 ? " · зарплата " + fmtMoney(p.payoutPerUnit) : ""}</span>
                    <button className="topic-remove" onClick={() => { setEditingProductId(p.id); setEditForm({ name: p.name, price: p.price, lessonsIncluded: p.lessonsIncluded || 0, paymentLink: p.paymentLink || "", payoutPerUnit: p.payoutPerUnit || 0 }); }}><Pencil size={12} /></button>
                    <button className="topic-remove" onClick={() => actions.removeProduct(p.id)}><X size={12} /></button>
                  </li>
                )
              ))}
              {showAddProductRow ? (
                <li className="product-edit-row">
                  <input className="mini-input wide" placeholder="Название" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Занятий" value={productForm.lessonsIncluded} onChange={(e) => setProductForm({ ...productForm, lessonsIncluded: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Зарплата учителю" value={productForm.payoutPerUnit} onChange={(e) => setProductForm({ ...productForm, payoutPerUnit: e.target.value })} />
                  <select className="mini-select" value={productForm.subject} onChange={(e) => setProductForm({ ...productForm, subject: e.target.value, department: SUBJECTS[e.target.value].dept })}>
                    {Object.keys(SUBJECTS).map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].emoji} {SUBJECTS[sub].label}</option>)}
                  </select>
                  <input className="mini-input wide" placeholder="Ссылка на оплату в ЮKassa (необязательно)" value={productForm.paymentLink} onChange={(e) => setProductForm({ ...productForm, paymentLink: e.target.value })} />
                  <button className="btn-icon" disabled={!productForm.name.trim() || !productForm.price} onClick={() => { actions.addProduct(productForm); setProductForm({ name: "", price: "", department: "language", subject: "english", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" }); setShowAddProductRow(false); }}><Check size={12} /></button>
                  <button className="btn-icon" onClick={() => setShowAddProductRow(false)}><X size={12} /></button>
                </li>
              ) : (
                <li className="add-product-row" onClick={() => setShowAddProductRow(true)}>
                  <Plus size={13} /> Добавить товар / услугу
                </li>
              )}
            </ul>
            <div className="hint-text">«Занятий в пакете» = 0 для разовой услуги. «Зарплата учителю» — сколько автоматически уйдёт учителю с каждой продажи этой позиции, вычтется из выручки в разделе «Финансы».</div>
          </div>
        )}
      </div>

      <div className="field-block">
        <div className="field-label">Скидка на приветственные пакеты</div>
        <div className="row-gap">
          <input type="number" className="mini-input" style={{ width: 80 }} value={discountDraft} onChange={(e) => setDiscountDraft(e.target.value)} />
          <span className="hint-text">%</span>
          <button className="btn-small accent" onClick={() => actions.setDiscount(Number(discountDraft) || 0)}>Сохранить</button>
        </div>
        <div className="hint-text" style={{ marginTop: 4 }}>Применяется автоматически при отметке «со скидкой» на продаже пакета — вычитается из цены товара.</div>
      </div>

      <div className="field-block">
        <div className="field-label">Новая продажа</div>
        <div className="add-panel">
          <div className="row-gap">
            <input type="date" className="mini-input" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} />
            <select className="mini-select" value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" className="mini-input" style={{ width: 60 }} value={saleForm.qty} onChange={(e) => setSaleForm({ ...saleForm, qty: Number(e.target.value) || 1 })} />
          </div>
          <div className="row-gap">
            <select className="mini-select" value={saleForm.studentId} onChange={(e) => {
              const st = students.find((s) => s.id === e.target.value);
              setSaleForm({ ...saleForm, studentId: e.target.value, teacherId: st ? st.teacherId : saleForm.teacherId });
            }}>
              <option value="">Без привязки к ученику</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="mini-select" value={saleForm.teacherId} onChange={(e) => setSaleForm({ ...saleForm, teacherId: e.target.value })}>
              <option value="">Без привязки к учителю</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="hint-text">Если выбрать ученика и товар-пакет — пакет автоматически назначится ученику. Учитель нужен, чтобы зарплата ушла по его ставке.</div>
          {(() => {
            const p = products.find((x) => x.id === saleForm.productId);
            const t = teachers.find((x) => x.id === saleForm.teacherId);
            const payoutPreview = calcPayout(p, saleForm.qty, t);
            return payoutPreview > 0 ? <div className="hint-text">Зарплата учителю по этой продаже: {fmtMoney(payoutPreview)} (запишется в расходы автоматически)</div> : null;
          })()}
          <label className="row-gap" style={{ fontSize: 12.5 }}>
            <input type="checkbox" checked={saleForm.discounted} onChange={(e) => setSaleForm({ ...saleForm, discounted: e.target.checked })} />
            Со welcome-скидкой ({discountPercent}%)
          </label>
          <button className="btn-small accent" disabled={!saleForm.productId} onClick={() => { actions.addSale(saleForm); setSaleForm({ ...saleForm, qty: 1, discounted: false, studentId: "" }); }}><Check size={12} /> Записать продажу</button>
        </div>
      </div>

      <div className="sales-log">
        {[...monthSales].sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
          const p = products.find((x) => x.id === s.productId);
          return (
            <div key={s.id} className="sales-log-row">
              <span>{formatDate(s.date)}</span>
              <span>{p ? p.name : "—"}{s.qty > 1 ? " × " + s.qty : ""}{s.discounted ? " (скидка)" : ""}</span>
              <span>{fmtMoney(s.amount)}</span>
              <button className="topic-remove" onClick={() => actions.removeSale(s.id)}><X size={12} /></button>
            </div>
          );
        })}
        {monthSales.length === 0 && <div className="muted-text">Нет записей за этот месяц</div>}
      </div>
    </div>
  );
}


/* -------------------------------- app --------------------------------- */

const ROLE_LABELS = {
  admin: "Личный кабинет администратора",
  teacher: "Личный кабинет учителя",
  student: "Личный кабинет ученика",
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(seedDiscountPercent);
  const [expenses, setExpenses] = useState([]);
  const [role, setRole] = useState("admin");
  const [department, setDepartment] = useState("language");
  const [asTeacherId, setAsTeacherId] = useState(null);
  const [asStudentId, setAsStudentId] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [resetArmed, setResetArmed] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  const persist = useCallback(async (key, value) => {
    try {
      const res = await window.storage.set(key, JSON.stringify(value), true);
      if (!res) throw new Error("empty response");
    } catch (e) {
      console.error("storage save failed", key, e);
      setErrorMsg("Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const tRes = await loadStrict("su-teachers-v3");
      const sRes = await loadStrict("su-students-v3");
      const schRes = await loadStrict("su-schedule-v3");
      const salRes = await loadStrict("su-sales-v3");
      const prodRes = await loadStrict("su-products-v2");
      const discRes = await loadStrict("su-discount-v2");
      const expRes = await loadStrict("su-expenses-v1");

      const t = (tRes.value || seedTeachers).map(normalizeTeacher);
      const s = (sRes.value || seedStudents).map(normalizeStudent);
      const sch = (schRes.value || seedSchedule).map(normalizeSlot);
      const sal = salRes.value || seedSales;
      const prod = (prodRes.value || seedProducts).map(normalizeProduct);
      const disc = discRes.value !== null ? discRes.value : seedDiscountPercent;
      const exp = (expRes.value || []).map(normalizeExpense);

      setTeachers(t);
      setStudents(s);
      setSchedule(sch);
      setSales(sal);
      setProducts(prod);
      setDiscountPercent(disc);
      setExpenses(exp);
      const langTeachers = t.filter((x) => x.department === "language");
      setAsTeacherId(langTeachers[0]?.id || t[0]?.id || null);
      const langTeacherIds = langTeachers.map((x) => x.id);
      setAsStudentId(s.find((x) => langTeacherIds.includes(x.teacherId))?.id || s[0]?.id || null);
      setLoading(false);

      // Persist under the current key whenever data came from seed data or was
      // recovered from an older key, so it's found directly next time.
      if (tRes.needsSave) persist("su-teachers-v3", t);
      if (sRes.needsSave) persist("su-students-v3", s);
      if (schRes.needsSave) persist("su-schedule-v3", sch);
      if (salRes.needsSave) persist("su-sales-v3", sal);
      if (prodRes.needsSave) persist("su-products-v2", prod);
      if (discRes.needsSave) persist("su-discount-v2", disc);
      if (expRes.needsSave) persist("su-expenses-v1", exp);
    })();
  }, [persist]);

  useEffect(() => {
    if (loading) return;
    const deptTeachers = teachers.filter((t) => t.department === department);
    if (!deptTeachers.find((t) => t.id === asTeacherId)) setAsTeacherId(deptTeachers[0]?.id || null);
    const deptTeacherIds = deptTeachers.map((t) => t.id);
    const deptStudents = students.filter((s) => deptTeacherIds.includes(s.teacherId));
    if (!deptStudents.find((s) => s.id === asStudentId)) setAsStudentId(deptStudents[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, loading]);

  const saveTeachers = (next) => { setTeachers(next); persist("su-teachers-v3", next); };
  const saveStudents = (next) => { setStudents(next); persist("su-students-v3", next); };
  const saveSchedule = (next) => { setSchedule(next); persist("su-schedule-v3", next); };
  const saveSales = (next) => { setSales(next); persist("su-sales-v3", next); };
  const saveProducts = (next) => { setProducts(next); persist("su-products-v2", next); };
  const saveDiscount = (next) => { setDiscountPercent(next); persist("su-discount-v2", next); };
  const saveExpenses = (next) => { setExpenses(next); persist("su-expenses-v1", next); };

  const [reminderTick, setReminderTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setReminderTick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const nowMs = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    const dueSlots = schedule.filter((sl) => {
      if (sl.reminderSent || sl.status !== "booked" || !sl.studentId) return false;
      const dt = new Date(sl.date + "T" + sl.time + ":00");
      const diff = dt.getTime() - nowMs;
      return diff > 0 && diff <= oneHourMs;
    });
    if (dueSlots.length === 0) return;
    const dueIds = new Set(dueSlots.map((sl) => sl.id));
    saveSchedule(schedule.map((sl) => (dueIds.has(sl.id) ? { ...sl, reminderSent: true } : sl)));
    const byStudent = {};
    dueSlots.forEach((sl) => { (byStudent[sl.studentId] = byStudent[sl.studentId] || []).push(sl); });
    saveStudents(students.map((s) => {
      if (!byStudent[s.id]) return s;
      const newMsgs = byStudent[s.id].map((sl) => ({
        id: uid("msg"), sender: "teacher",
        text: "Напоминание: через час у вас урок в " + sl.time + ".",
        attachment: null, reactions: {}, at: new Date().toISOString(),
      }));
      return { ...s, messages: [...(s.messages || []), ...newMsgs] };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, students, reminderTick, loading]);

  const actions = {
    addTeacher: ({ name, contact, subject, department: dept }) => {
      const id = uid("t");
      saveTeachers([...teachers, { id, name: name.trim(), contact: (contact || "").trim(), department: dept, subject, photo: "", bio: "", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } }]);
      return id;
    },
    updateTeacher: (id, patch) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    toggleTeacherAvailability: (id) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, available: !t.available } : t))),
    setAvailableSpots: (id, count) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, availableSpots: count } : t))),
    deleteTeacher: (id) => {
      const hasStudents = students.some((s) => s.teacherId === id);
      if (hasStudents) return;
      saveTeachers(teachers.filter((t) => t.id !== id));
      saveSchedule(schedule.filter((sl) => sl.teacherId !== id));
    },
    addStudent: (teacherId, { name, contact, goal, startLevel, startNote }) => {
      const teacher = teachers.find((t) => t.id === teacherId);
      const lvl = startLevel || firstLevel(teacher.subject);
      const id = uid("s");
      saveStudents([...students, {
        id, teacherId, name: name.trim(), contact: (contact || "").trim(), startLevel: lvl, currentLevel: lvl, startNote: (startNote || "").trim(),
        goal: (goal || "").trim(), status: "trial", planType: "individual", grammarTopics: [], vocabTopics: [], materials: [], homework: [], messages: [],
        packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
        pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
      }]);
      return id;
    },
    updateStudent: (id, patch) => saveStudents(students.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    deleteStudent: (id) => {
      saveStudents(students.filter((s) => s.id !== id));
      saveSchedule(schedule.filter((sl) => sl.studentId !== id));
    },
    setPackage: (studentId, productId) => saveStudents(students.map((s) => {
      if (s.id !== studentId) return s;
      if (!productId) return { ...s, packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "" };
      const product = products.find((p) => p.id === productId);
      return { ...s, packageProductId: productId, packageTotal: product ? product.lessonsIncluded : null, packageAssignedAt: isoDate(0), packageLabel: product ? product.name : "" };
    })),
    setPackagePlan: (studentId, { packageProductId, packageTotal, packageLabel }) => saveStudents(students.map((s) => {
      if (s.id !== studentId) return s;
      if (packageTotal === null) return { ...s, packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "" };
      return { ...s, packageProductId: packageProductId || null, packageTotal, packageLabel: packageLabel || "", packageAssignedAt: s.packageAssignedAt || isoDate(0) };
    })),
    addCheckpoint: (studentId, { title, maxScore, achievedScore, note }) => saveStudents(students.map((s) => s.id === studentId ? { ...s, checkpoints: [...(s.checkpoints || []), { id: uid("chk"), title: title.trim(), maxScore: Number(maxScore), achievedScore: Number(achievedScore), note: (note || "").trim(), date: isoDate(0) }] } : s)),
    removeCheckpoint: (studentId, chkId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, checkpoints: (s.checkpoints || []).filter((c) => c.id !== chkId) } : s)),
    toggleCanRequestTeacherChange: (studentId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, canRequestTeacherChange: !s.canRequestTeacherChange } : s)),
    requestTeacherChange: (studentId, note) => saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherChangeRequest: { at: new Date().toISOString(), note: note || "" } } : s)),
    dismissTeacherChangeRequest: (studentId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherChangeRequest: null } : s)),
    reassignStudentTeacher: (studentId, newTeacherId) => {
      saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherId: newTeacherId, teacherChangeRequest: null, canRequestTeacherChange: false } : s));
      saveSchedule(schedule.filter((sl) => !(sl.studentId === studentId && sl.date >= isoDate(0))));
    },
    updatePageTheme: (studentId, patch) => saveStudents(students.map((s) => s.id === studentId ? { ...s, pageTheme: { ...(s.pageTheme || {}), ...patch } } : s)),
    addTopic: (studentId, kind, name) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: [...s[kind], { id: uid("tp"), name, status: "todo" }] } : s)),
    removeTopic: (studentId, kind, topicId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: s[kind].filter((t) => t.id !== topicId) } : s)),
    cycleTopicStatus: (studentId, kind, topicId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: s[kind].map((t) => t.id === topicId ? { ...t, status: nextTopicStatus(t.status) } : t) } : s)),
    setExamTarget: (studentId, examTarget) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examTarget, examTopics: examTarget ? (s.examTopics || []) : [] } : s)),
    addMaterial: (studentId, title, note, url, file) => saveStudents(students.map((s) => s.id === studentId ? { ...s, materials: [...(s.materials || []), { id: uid("m"), title, note, url: url || "", fileName: file?.name || "", fileType: file?.type || "", fileDataUrl: file?.dataUrl || "" }] } : s)),
    removeMaterial: (studentId, matId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, materials: (s.materials || []).filter((m) => m.id !== matId) } : s)),
    addExamMaterial: (studentId, title, note, url, file) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examMaterials: [...(s.examMaterials || []), { id: uid("em"), title, note, url: url || "", fileName: file?.name || "", fileType: file?.type || "", fileDataUrl: file?.dataUrl || "" }] } : s)),
    removeExamMaterial: (studentId, matId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examMaterials: (s.examMaterials || []).filter((m) => m.id !== matId) } : s)),
    addHomework: (studentId, { title, material, dueDate, materialAttachment }) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: [...(s.homework || []), { id: uid("hw"), title: title.trim(), material: (material || "").trim(), materialAttachment: materialAttachment || null, dueDate: dueDate || null, status: "assigned", submissionText: "", submissionAttachment: null, submittedAt: null, feedback: "", createdAt: isoDate(0) }] } : s)),
    submitHomework: (studentId, hwId, text, attachment) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, submissionText: text, submissionAttachment: attachment || null, submittedAt: new Date().toISOString(), status: "submitted" } : h) } : s)),
    markHomeworkInReview: (studentId, hwId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, status: "in_review" } : h) } : s)),
    reviewHomework: (studentId, hwId, feedback) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, feedback: feedback || "", status: "reviewed" } : h) } : s)),
    sendHomeworkForRevision: (studentId, hwId, feedback) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, feedback: feedback || "", status: "needs_revision" } : h) } : s)),
    reopenHomework: (studentId, hwId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, status: "in_review" } : h) } : s)),
    sendMessage: (studentId, sender, text, attachment) => saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), { id: uid("msg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : s)),
    toggleMessageReaction: (studentId, messageId, who, emoji) => saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: (s.messages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : s)),
    sendSupportMessage: (studentId, sender, text, attachment) => saveStudents(students.map((s) => s.id === studentId ? { ...s, supportMessages: [...(s.supportMessages || []), { id: uid("smsg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : s)),
    toggleSupportReaction: (studentId, messageId, who, emoji) => saveStudents(students.map((s) => s.id === studentId ? { ...s, supportMessages: (s.supportMessages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : s)),
    sendStaffMessage: (teacherId, sender, text, attachment) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, staffMessages: [...(t.staffMessages || []), { id: uid("stmsg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : t)),
    toggleStaffReaction: (teacherId, messageId, who, emoji) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, staffMessages: (t.staffMessages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : t)),
    addSlot: (teacherId, { date, time, duration, type, studentId, trialName }) => {
      saveSchedule([...schedule, {
        id: uid("sl"), teacherId, studentId: studentId || null, trialName: trialName || "", date, time, duration, type,
        status: (studentId || trialName) ? "booked" : "available",
        requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null,
      }]);
      if (studentId) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), {
          id: uid("msg"), sender: "teacher", text: "Вам назначен урок: " + formatDate(date) + ", " + time + ".", attachment: null, reactions: {}, at: new Date().toISOString(),
        }] } : s));
      }
    },
    assignSlot: (slotId, studentId) => {
      const slot = schedule.find((sl) => sl.id === slotId);
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, studentId, status: "booked" } : sl));
      if (slot) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), {
          id: uid("msg"), sender: "teacher", text: "Вам назначен урок: " + formatDate(slot.date) + ", " + slot.time + ".", attachment: null, reactions: {}, at: new Date().toISOString(),
        }] } : s));
      }
    },
    cancelSlot: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, status: "cancelled" } : sl)),
    rescheduleSlot: (slotId, newDate, newTime) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, history: [...sl.history, { date: sl.date, time: sl.time }], date: newDate, time: newTime, requested: null, status: "booked" } : sl)),
    updateSlotDetails: (slotId, { duration, type, trialName }) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, duration, type, trialName: trialName || "" } : sl)),
    addSlotTopic: (slotId, name) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, topicsCovered: [...(sl.topicsCovered || []), name] } : sl)),
    removeSlotTopic: (slotId, name) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, topicsCovered: (sl.topicsCovered || []).filter((n) => n !== name) } : sl)),
    setSlotMaterial: (slotId, text) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, lessonMaterial: text } : sl)),
    toggleSlotPaid: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paid: !sl.paid } : sl)),
    payForSlot: (slotId, { productId, teacherId }) => {
      // Student-facing: only RECORDS that the student says they paid. Does NOT mark the lesson
      // paid, does NOT record a sale, and does NOT touch package balances — that requires
      // confirmPayment(), which is only reachable from teacher/admin UI (perm.schedule).
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paymentRequest: { productId, teacherId, requestedAt: new Date().toISOString() } } : sl));
    },
    confirmPayment: (slotId) => {
      const slot = schedule.find((sl) => sl.id === slotId);
      if (!slot || !slot.paymentRequest) return;
      const { productId } = slot.paymentRequest;
      const product = products.find((p) => p.id === productId);
      const teacher = teachers.find((t) => t.id === slot.teacherId);
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paid: true, paymentRequest: null } : sl));
      const amount = calcSaleAmount(product, 1, false, discountPercent);
      const payout = calcPayout(product, 1, teacher);
      const saleId = uid("sale");
      saveSales([...sales, { id: saleId, date: isoDate(0), productId, qty: 1, discounted: false, studentId: slot.studentId, teacherId: slot.teacherId, amount, payout }]);
      if (payout > 0) {
        saveExpenses([...expenses, { id: uid("exp"), date: isoDate(0), category: "Зарплата учителю", amount: payout, note: (teacher ? teacher.name : "Учитель") + " — " + (product ? product.name : ""), linkedSaleId: saleId, auto: true }]);
      }
      if (product && product.lessonsIncluded > 0 && slot.studentId) {
        saveStudents(students.map((s) => s.id === slot.studentId ? { ...s, packageProductId: product.id, packageTotal: product.lessonsIncluded, packageAssignedAt: isoDate(0) } : s));
      }
    },
    dismissPaymentRequest: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paymentRequest: null } : sl)),
    setMeetingLink: (slotId, link) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, meetingLink: link } : sl)),
    setSlotPaymentLink: (slotId, link) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, slotPaymentLink: link } : sl)),
    requestReschedule: (slotId, date, time, note) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, status: "reschedule-requested", requested: { date, time, note } } : sl)),
    resolveRequest: (slotId, accept) => saveSchedule(schedule.map((sl) => {
      if (sl.id !== slotId) return sl;
      if (accept && sl.requested) return { ...sl, history: [...sl.history, { date: sl.date, time: sl.time }], date: sl.requested.date, time: sl.requested.time, requested: null, status: "booked" };
      return { ...sl, requested: null, status: "booked" };
    })),
    addProduct: ({ name, price, department: dept, subject, lessonsIncluded, paymentLink, payoutPerUnit }) => saveProducts([...products, { id: uid("prod"), name: name.trim(), price: Number(price) || 0, department: dept || "language", subject: subject || null, lessonsIncluded: Number(lessonsIncluded) || 0, paymentLink: (paymentLink || "").trim(), payoutPerUnit: Number(payoutPerUnit) || 0 }]),
    updateProduct: (id, patch) => saveProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    removeProduct: (id) => saveProducts(products.filter((p) => p.id !== id)),
    setDiscount: (percent) => saveDiscount(Number(percent) || 0),
    setTeacherPayoutRate: (teacherId, productId, amount) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, payoutOverrides: { ...(t.payoutOverrides || {}), [productId]: amount === null ? undefined : Number(amount) || 0 } } : t)),
    addSale: ({ date, productId, qty, discounted, studentId, teacherId }) => {
      const product = products.find((p) => p.id === productId);
      const teacher = teachers.find((t) => t.id === teacherId);
      const amount = calcSaleAmount(product, qty || 1, discounted, discountPercent);
      const payout = calcPayout(product, qty || 1, teacher);
      const saleId = uid("sale");
      saveSales([...sales, { id: saleId, date, productId, qty: qty || 1, discounted: !!discounted, studentId: studentId || null, teacherId: teacherId || null, amount, payout }]);
      if (payout > 0 && teacherId) {
        saveExpenses([...expenses, { id: uid("exp"), date, category: "Зарплата учителю", amount: payout, note: (teacher ? teacher.name : "Учитель") + " — " + (product ? product.name : ""), linkedSaleId: saleId, auto: true }]);
      }
      if (studentId && product && product.lessonsIncluded > 0) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, packageProductId: product.id, packageTotal: product.lessonsIncluded, packageAssignedAt: date } : s));
      }
    },
    removeSale: (id) => {
      saveSales(sales.filter((x) => x.id !== id));
      saveExpenses(expenses.filter((e) => e.linkedSaleId !== id));
    },
    addExpense: (date, category, amount, note) => saveExpenses([...expenses, { id: uid("exp"), date, category, amount: Number(amount) || 0, note: note || "" }]),
    removeExpense: (id) => saveExpenses(expenses.filter((x) => x.id !== id)),
    resetDemo: () => { saveTeachers(seedTeachers); saveStudents(seedStudents); saveSchedule(seedSchedule); saveSales(seedSales); saveProducts(seedProducts); saveDiscount(seedDiscountPercent); saveExpenses([]); setResetArmed(false); },
  };

  async function runDiagnostics() {
    try {
      const results = [];
      for (const prefix of ["su-", "school-"]) {
        const listing = await window.storage.list(prefix, true);
        for (const k of listing.keys || []) {
          try {
            const r = await window.storage.get(k, true);
            const parsed = JSON.parse(r.value);
            const info = Array.isArray(parsed) ? parsed.length + " записей" : (parsed && typeof parsed === "object" ? Object.keys(parsed).length + " полей" : String(parsed));
            results.push({ key: k, info });
          } catch (e) {
            results.push({ key: k, info: "не читается" });
          }
        }
      }
      setDiagnostics(results);
    } catch (e) {
      setDiagnostics([]);
      setErrorMsg("Не удалось просканировать хранилище: " + e.message);
    }
  }

  async function forceRestoreFrom(key, targetType) {
    try {
      const r = await window.storage.get(key, true);
      const parsed = JSON.parse(r.value);
      if (targetType === "teachers") saveTeachers(parsed.map(normalizeTeacher));
      else if (targetType === "students") saveStudents(parsed.map(normalizeStudent));
      else if (targetType === "schedule") saveSchedule(parsed.map(normalizeSlot));
      else if (targetType === "sales") saveSales(parsed);
      else if (targetType === "products") saveProducts(parsed.map(normalizeProduct));
      else if (targetType === "discount") saveDiscount(parsed);
      else if (targetType === "expenses") saveExpenses(parsed.map(normalizeExpense));
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Не удалось восстановить из ключа " + key + ": " + e.message);
    }
  }

  function exportAllData() {
    const payload = { teachers, students, schedule, sales, products, discountPercent, expenses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-umbrella-backup-" + isoDate(0) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importAllData(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      if (data.teachers) saveTeachers(data.teachers.map(normalizeTeacher));
      if (data.students) saveStudents(data.students.map(normalizeStudent));
      if (data.schedule) saveSchedule(data.schedule.map(normalizeSlot));
      if (data.sales) saveSales(data.sales);
      if (data.products) saveProducts(data.products.map(normalizeProduct));
      if (typeof data.discountPercent === "number") saveDiscount(data.discountPercent);
      if (data.expenses) saveExpenses(data.expenses.map(normalizeExpense));
      setErrorMsg("");
      return true;
    } catch (e) {
      setErrorMsg("Не удалось прочитать файл импорта: " + e.message);
      return false;
    }
  }

  if (loading) {
    return (
      <div className="app-root loading-root">
        <style>{CSS}</style>
        <Loader2 className="spin" size={22} />
        <span>Загружаем данные школы…</span>
      </div>
    );
  }

  const currentTeacher = teachers.find((t) => t.id === asTeacherId && t.department === department) || teachers.filter((t) => t.department === department)[0];
  const currentStudent = students.find((s) => s.id === asStudentId) || null;
  const currentStudentTeacher = currentStudent ? teachers.find((t) => t.id === currentStudent.teacherId) : null;
  const deptTeachersForSelect = teachers.filter((t) => t.department === department);
  const deptStudentsForSelect = students.filter((s) => {
    const t = teachers.find((tt) => tt.id === s.teacherId);
    return t && t.department === department;
  });

  return (
    <div className={"app-root theme-" + department}>
      <style>{CSS}</style>

      <header className="top-bar">
        <svg className="header-wave" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,20 C150,40 350,0 500,20 C650,40 850,0 1000,20 C1100,32 1150,10 1200,20 L1200,0 L0,0 Z" style={{ fill: "var(--accent)", opacity: 0.10 }} />
        </svg>
        <img src={LOGO_DATA_URI} alt="Study Umbrella" className="brand-logo" />
        <div className="header-titles">
          <div className="brand-name">Study Umbrella</div>
          <div className="muted-text">{ROLE_LABELS[role]}</div>
        </div>

        <div className="role-switch">
          <button className={role === "admin" ? "role-btn active" : "role-btn"} onClick={() => setRole("admin")}>Администратор</button>
          <button className={role === "teacher" ? "role-btn active" : "role-btn"} onClick={() => setRole("teacher")}>Учитель</button>
          <button className={role === "student" ? "role-btn active" : "role-btn"} onClick={() => setRole("student")}>Ученик</button>
        </div>

        {role === "teacher" && (
          <select className="mini-select" value={asTeacherId || ""} onChange={(e) => setAsTeacherId(e.target.value)}>
            {deptTeachersForSelect.map((t) => <option key={t.id} value={t.id}>Я — {t.name}</option>)}
          </select>
        )}
        {role === "student" && (
          <select className="mini-select" value={asStudentId || ""} onChange={(e) => setAsStudentId(e.target.value)}>
            {deptStudentsForSelect.map((s) => <option key={s.id} value={s.id}>Я — {s.name}</option>)}
          </select>
        )}
      </header>

      <div className="dept-bar">
        <button className={"dept-btn dept-language" + (department === "language" ? " active" : "")} onClick={() => setDepartment("language")}>🌐 Языковое подразделение</button>
        <button className={"dept-btn dept-humanities" + (department === "humanities" ? " active" : "")} onClick={() => setDepartment("humanities")}>📚 Гуманитарное подразделение</button>
      </div>

      {noticeVisible && (
        <div className="notice">
          <AlertCircle size={14} />
          <span>Это рабочий прототип: данные общие для всех, у кого есть ссылка, без пароля. Переключатель ролей вверху имитирует вход — для реального использования понадобится настоящая авторизация.</span>
          <button className="notice-close" onClick={() => setNoticeVisible(false)}><X size={13} /></button>
        </div>
      )}

      {errorMsg && (
        <div className="notice error">
          <AlertCircle size={14} /> <span>{errorMsg}</span>
          <button className="notice-close" onClick={() => setErrorMsg("")}><X size={13} /></button>
        </div>
      )}

      <main className="main-area">
        {role === "admin" && <AdminView department={department} teachers={teachers} students={students} schedule={schedule} sales={sales} products={products} discountPercent={discountPercent} expenses={expenses} actions={actions} />}
        {role === "teacher" && currentTeacher && (
          <TeacherView teacher={currentTeacher} teachers={teachers} students={students} schedule={schedule} actions={actions} products={products} perm={{ profile: true, schedule: true, package: true }} />
        )}
        {role === "teacher" && !currentTeacher && <EmptyState icon={Users} title="В этом подразделении пока нет учителей" />}
        {role === "student" && currentStudent && currentStudentTeacher && (
          <StudentView student={currentStudent} teacher={currentStudentTeacher} schedule={schedule} actions={actions} products={products} />
        )}
        {role === "student" && !currentStudent && <EmptyState icon={GraduationCap} title="В этом подразделении пока нет учеников" />}
      </main>

      <footer className="foot-bar">
        <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="row-gap">
            {!resetArmed ? (
              <button className="btn-small" onClick={() => setResetArmed(true)}><RotateCcw size={12} /> Сбросить к демо-данным</button>
            ) : (
              <span className="row-gap">
                Точно сбросить все данные?
                <button className="btn-small danger" onClick={actions.resetDemo}>Да, сбросить</button>
                <button className="btn-small" onClick={() => setResetArmed(false)}>Отмена</button>
              </span>
            )}
          </div>
          <div className="row-gap">
            <button className="btn-small accent" onClick={exportAllData}>⬇️ Скачать резервную копию</button>
            <label className="btn-small">
              ⬆️ Загрузить резервную копию
              <input
                type="file" accept="application/json" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  e.target.value = "";
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => { if (importAllData(reader.result)) setErrorMsg("__imported_ok__"); };
                  reader.readAsText(file);
                }}
              />
            </label>
            <button className="btn-small" onClick={runDiagnostics}>🔍 Показать ключи хранилища</button>
          </div>
        </div>
        {errorMsg === "__imported_ok__" && (
          <div className="hint-text" style={{ color: "var(--accent)", marginTop: 6 }}>Резервная копия загружена.</div>
        )}
        <div className="hint-text" style={{ marginTop: 6 }}>
          Рекомендуем время от времени скачивать резервную копию — она сохраняется как обычный файл на вашем компьютере и её всегда можно загрузить обратно.
        </div>
        {diagnostics && (
          <div className="add-panel" style={{ marginTop: 8 }}>
            <div className="row-gap" style={{ justifyContent: "space-between" }}>
              <span className="hint-text">Всё, что реально есть в хранилище (su-/school-):</span>
              <button className="btn-icon" onClick={() => setDiagnostics(null)}><X size={14} /></button>
            </div>
            {diagnostics.length === 0 && <div className="muted-text">Ключей не найдено — хранилище для этого артефакта пустое.</div>}
            {diagnostics.map((d) => (
              <div key={d.key} className="sales-log-row">
                <span>{d.key}</span>
                <span>{d.info}</span>
                <select className="mini-select" defaultValue="" onChange={(e) => { if (e.target.value) { forceRestoreFrom(d.key, e.target.value); e.target.value = ""; } }}>
                  <option value="">Загрузить как…</option>
                  <option value="teachers">Учителя</option>
                  <option value="students">Ученики</option>
                  <option value="schedule">Расписание</option>
                  <option value="sales">Продажи</option>
                  <option value="products">Товары</option>
                  <option value="discount">Скидка</option>
                  <option value="expenses">Траты</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

/* --------------------------------- css --------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root {
  --ink: #2B2B2B;
  --ink-soft: #6B6862;
  --paper: #F7F5F2;
  --card: #FFFFFF;
  --border: #E6E1DA;
  --coral: #D65655;
  --coral-soft: #F7DEDD;
  --teal: #449999;
  --teal-soft: #DCEDEC;
  --accent: var(--coral);
  --accent-soft: var(--coral-soft);
  --gold: #A9791E;
  --gold-soft: #F3E6C6;
  --danger: #A3423D;
  --danger-soft: #F3DEDC;
  --font-display: 'Fraunces', Georgia, serif;
  --font-ui: 'IBM Plex Sans', system-ui, sans-serif;
}

.theme-language { --accent: var(--teal); --accent-soft: var(--teal-soft); }
.theme-humanities { --accent: var(--coral); --accent-soft: var(--coral-soft); }

.subj-english { --accent: #8B6FB3; --accent-soft: #E8E1F2; }
.subj-spanish { --accent: #C9922E; --accent-soft: #F5E7CC; }
.subj-chinese { --accent: #E0685C; --accent-soft: #FBDEDB; }
.subj-korean { --accent: #6FA8C7; --accent-soft: #DCEEF5; }
.subj-history { --accent: #C1673F; --accent-soft: #F3E1D6; }
.subj-social { --accent: #B23A3A; --accent-soft: #F5DCDC; }
.subj-russian { --accent: #9C3F5C; --accent-soft: #F2DEE6; }

.app-root {
  font-family: var(--font-ui); background: var(--paper); color: var(--ink); min-height: 100%; padding: 0; border-radius: 12px;
  background-image:
    linear-gradient(128deg, transparent 30%, rgba(178, 156, 118, 0.10) 34%, transparent 38%),
    linear-gradient(35deg, transparent 55%, rgba(205, 184, 148, 0.09) 59%, transparent 63%),
    radial-gradient(ellipse 100% 80% at 8% 10%, rgba(196, 172, 132, 0.30), transparent 68%),
    radial-gradient(ellipse 95% 75% at 95% 5%, rgba(214, 196, 160, 0.26), transparent 62%),
    radial-gradient(ellipse 110% 85% at 85% 95%, rgba(180, 155, 115, 0.22), transparent 68%),
    radial-gradient(ellipse 90% 70% at 2% 98%, rgba(222, 205, 175, 0.28), transparent 62%),
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200, 180, 145, 0.15), transparent 68%);
  background-attachment: fixed;
}
.loading-root { display:flex; align-items:center; justify-content:center; gap:10px; padding: 60px 0; color: var(--ink-soft); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.top-bar { position:relative; overflow:hidden; display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--card); }
.header-wave { position:absolute; left:0; right:0; bottom:0; width:100%; height:40px; pointer-events:none; }
.brand-logo { height: 46px; width: auto; display:block; position:relative; z-index:1; }
.header-titles { display:flex; flex-direction:column; margin-right: 8px; position:relative; z-index:1; }
.brand-name { font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--ink); line-height:1.1; }
.role-switch { display:flex; gap:2px; background: var(--paper); border:1px solid var(--border); border-radius: 10px; padding:2px; margin-left: auto; position:relative; z-index:1; }
.role-btn { border:none; background:transparent; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:500; color: var(--ink-soft); cursor:pointer; transition: all .15s ease; }
.role-btn.active { background: var(--ink); color:#fff; }

.dept-bar { display:flex; gap:8px; padding: 10px 20px; border-bottom: 1px solid var(--border); background: var(--card); }
.dept-btn { border:1.5px solid var(--border); background: var(--paper); padding:7px 16px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; color: var(--ink-soft); transition: all .15s ease; }
.dept-btn:hover { transform: translateY(-1px); }
.dept-btn.dept-language.active { background: var(--teal); border-color: var(--teal); color:#fff; }
.dept-btn.dept-humanities.active { background: var(--coral); border-color: var(--coral); color:#fff; }

.notice { display:flex; align-items:center; gap:8px; font-size:12.5px; background: var(--accent-soft); color: var(--ink); padding:8px 20px; }
.notice.error { background: var(--danger-soft); }
.notice-close { margin-left:auto; background:none; border:none; cursor:pointer; color: var(--ink-soft); }

.main-area { padding: 18px 20px; }
.foot-bar { padding: 10px 20px; border-top: 1px solid var(--border); }

.card { background: var(--card); border:1px solid var(--border); border-top: 4px solid var(--accent); border-radius: 16px; padding: 18px; margin-bottom: 16px; }
.card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom: 10px; }
.card h2 { font-family: var(--font-display); font-size: 20px; margin:0 0 2px 0; }
.card h3, .col-header h3 { font-family: var(--font-display); font-size: 15px; margin:0; display:flex; align-items:center; gap:6px; }

.field-block { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border); }
.field-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 6px; font-weight:600; }
.body-text { font-size: 14px; line-height:1.5; margin:0; white-space: pre-wrap; }
.muted-text { font-size: 12.5px; color: var(--ink-soft); }
.hint-text { font-size: 11.5px; color: var(--ink-soft); }

.pill { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; background: var(--border); color: var(--ink-soft); }
.pill-accent { background: var(--accent-soft); color: var(--accent); }
.pill-teal { background: var(--teal-soft); color: var(--teal); }
.pill-gold { background: var(--gold-soft); color: var(--gold); }
.pill-danger { background: var(--danger-soft); color: var(--danger); }
.pill-green { background: #DCEEDC; color: #3C8C3C; }

.progress-track { position:relative; height: 18px; background: var(--border); border-radius: 999px; overflow:hidden; margin-bottom:6px; }
.progress-fill { height:100%; background: var(--accent); border-radius:999px; transition: width .3s ease; }
.progress-label { position:absolute; right:8px; top:0; font-size:10.5px; line-height:18px; color: var(--ink); font-weight:600; }

.level-ladder { display:flex; gap:5px; margin-top: 14px; }
.ladder-step { flex:1; text-align:center; padding:7px 4px; border-radius:8px; background: var(--border); color: var(--ink-soft); font-size:11.5px; font-weight:600; position:relative; }
.ladder-step.filled { background: var(--accent-soft); color: var(--accent); }
.ladder-step.current { background: var(--accent); color:#fff; box-shadow: 0 0 0 3px var(--accent-soft); }
.ladder-tag { position:absolute; top:-15px; left:50%; transform:translateX(-50%); font-size:9px; color: var(--gold); font-weight:700; text-transform:uppercase; white-space:nowrap; }
.level-fallback { display:flex; align-items:center; gap:6px; margin-top:8px; }

.chip-row { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:500; padding:5px 10px; border-radius:999px; border:1.5px solid var(--border); background: var(--card); color: var(--ink-soft); cursor:pointer; transition: all .12s ease; }
.chip:hover:not(:disabled) { transform: translateY(-1px); }
.chip-symbol { font-size:11px; }
.chip-todo { background: var(--card); border-color: var(--border); color: var(--ink-soft); }
.chip-in_progress { background: var(--gold-soft); border-color: var(--gold); color: var(--gold); border-style: dashed; }
.chip-done { background: var(--accent); border-color: var(--accent); color: #fff; }
.chip:disabled { cursor:default; }
.topic-dropdown { margin-top:8px; background: var(--paper); border:1px solid var(--border); border-radius:10px; padding:10px; }
.topic-dropdown-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:4px 12px; margin-bottom:10px; max-height:220px; overflow-y:auto; }
.topic-option { display:flex; align-items:center; gap:7px; font-size:12.5px; padding:3px 0; cursor:pointer; }

.materials-list { list-style:none; margin:6px 0; padding:0; display:flex; flex-direction:column; gap:5px; }
.materials-list li { display:flex; align-items:center; gap:7px; font-size:13px; padding:6px 8px; border-radius:8px; background: var(--paper); }
.product-edit-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; background: var(--paper); border-radius:8px; padding:6px 8px; }
.materials-block { padding: 10px 0; border-top: 1px dashed var(--border); }
.materials-block:first-child { border-top:none; }
.materials-block-head { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.topic-remove { margin-left:auto; background:none; border:none; color: var(--ink-soft); cursor:pointer; }

.homework-list { display:flex; flex-direction:column; gap:10px; margin-top:8px; }
.homework-item { background: var(--paper); border-radius:12px; padding:12px; }
.hw-submission { background: var(--card); border-radius:8px; padding:8px; margin-top:6px; }
.hw-feedback { margin-top:6px; font-size:12.5px; background: var(--accent-soft); color: var(--ink); padding:6px 8px; border-radius:8px; }

.chat-box { display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto; padding:6px 2px; }
.chat-bubble { max-width:75%; padding:8px 12px; border-radius:14px; font-size:13px; }
.chat-bubble.mine { align-self:flex-end; background: var(--accent); color:#fff; border-bottom-right-radius:4px; }
.chat-bubble.theirs { align-self:flex-start; background: var(--paper); color: var(--ink); border-bottom-left-radius:4px; }
.chat-time { font-size:10px; opacity:.75; margin-top:3px; }

.slot-group-label { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color: var(--ink-soft); margin: 14px 0 6px; font-weight:600; }
.past-lessons-section { margin-top: 16px; padding-top: 12px; border-top: 2px dotted var(--border); }
.past-lessons-toggle { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-size:12px; font-weight:600; color: var(--ink-soft); padding:4px 0; }
.past-chevron { display:inline-block; transition: transform .15s ease; }
.past-chevron.open { transform: rotate(90deg); }
.past-list { margin-top: 8px; opacity: 0.75; filter: grayscale(30%); }
.past-list .slot-row { background: var(--paper); }
.past-lesson-card { background: var(--paper); border-radius:10px; padding:10px 12px; margin-bottom:8px; font-size:12.5px; }
.past-lesson-card.cancelled { opacity:.6; }
.slot-list { display:flex; flex-direction:column; gap:8px; }
.slot-row { background: var(--paper); border-radius:10px; padding:8px 10px; font-size:12.5px; }
.slot-row.status-cancelled { opacity:.55; }
.slot-when { display:flex; justify-content:space-between; font-weight:600; margin-bottom:4px; }
.slot-time { display:flex; align-items:center; gap:4px; font-weight:400; color: var(--ink-soft); }
.slot-mid { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:6px; }
.slot-student { font-weight:600; }
.slot-request-note { font-size:11.5px; color: var(--gold); }
.slot-actions { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.slot-history { margin-top:6px; font-size:10.5px; color: var(--ink-soft); }

.schedule-wrap { }
.schedule-nav { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
.schedule-range { font-weight:600; font-size:13px; font-family: var(--font-display); }
.schedule-grid-scroll { overflow-x:auto; }
.schedule-grid { display:grid; gap:3px; min-width:640px; }
.schedule-corner { background:transparent; }
.schedule-day-head { text-align:center; background: var(--paper); border-radius:8px; padding:5px 2px; font-size:11.5px; }
.schedule-day-head.is-today { background: var(--accent-soft); color: var(--accent); font-weight:700; }
.schedule-day-name { text-transform:capitalize; font-weight:600; }
.schedule-day-date { color: var(--ink-soft); font-size:10.5px; }
.schedule-time-label { font-size:10.5px; color: var(--ink-soft); text-align:right; padding-right:4px; align-self:center; }
.schedule-cell { min-height:34px; background: var(--paper); border-radius:6px; padding:2px; display:flex; flex-direction:column; gap:2px; }
.schedule-cell.is-empty { cursor:pointer; }
.schedule-cell.is-empty:hover { background: var(--accent-soft); }
.schedule-chip { border:none; border-radius:5px; padding:2px 4px; font-size:9.5px; text-align:left; cursor:pointer; line-height:1.25; background: var(--border); color: var(--ink-soft); }
.schedule-chip.status-available { background: var(--card); border: 1px dashed var(--accent); color: var(--accent); }
.schedule-chip.status-booked { background: var(--accent); color:#fff; }
.schedule-chip.status-reschedule-requested { background: var(--gold-soft); color: var(--gold); border: 1px solid var(--gold); }
.chip-time { font-weight:700; display:block; }
.chip-info { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.schedule-add-panel, .schedule-detail { margin-top:12px; }
.schedule-detail { background: var(--paper); border-radius:10px; padding:10px; }

.add-panel { display:flex; flex-direction:column; gap:8px; background: var(--paper); border-radius:12px; padding:12px; margin-bottom:10px; }
.row-gap { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

.mini-input, .mini-select, .mini-textarea { font-family: var(--font-ui); font-size:12.5px; border:1px solid var(--border); border-radius:7px; padding:5px 8px; background:#fff; color: var(--ink); }
.mini-input.wide { flex:1; min-width:160px; }
.mini-textarea { width:100%; min-height:52px; resize:vertical; }

.btn-icon { background: var(--accent); color:#fff; border:none; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform .12s ease; }
.btn-icon:hover:not(:disabled) { transform: translateY(-1px); }
.btn-icon:disabled { opacity:.4; cursor:not-allowed; }
.btn-icon.danger { background: var(--danger); }
.btn-small { display:inline-flex; align-items:center; gap:4px; background:#fff; border:1px solid var(--border); border-radius:8px; padding:5px 10px; font-size:12px; font-weight:500; cursor:pointer; color: var(--ink); transition: transform .12s ease; }
.btn-small:hover { transform: translateY(-1px); }
.btn-small.accent { background: var(--accent); color:#fff; border-color: var(--accent); }
.btn-small.danger { background: var(--danger); color:#fff; border-color: var(--danger); }

.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding: 26px 10px; color: var(--ink-soft); text-align:center; }
.empty-title { font-weight:600; font-size:13px; }
.empty-hint { font-size:11.5px; }

.tabs { display:flex; gap:4px; margin-bottom:14px; flex-wrap:wrap; }
.tab { display:inline-flex; align-items:center; gap:5px; background: var(--card); border:1px solid var(--border); padding:7px 14px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; color: var(--ink-soft); transition: transform .12s ease; }
.tab:hover { transform: translateY(-1px); }
.tab.active { background: var(--accent); color:#fff; border-color: var(--accent); }

.subject-group { margin-bottom: 18px; }
.subject-group-title { font-family: var(--font-display); font-size: 15px; font-weight:700; margin-bottom:8px; padding-bottom:6px; border-bottom: 2px solid var(--accent-soft); }
.thread-row-wrap { margin-bottom: 6px; }
.thread-row { display:flex; align-items:center; gap:10px; width:100%; text-align:left; background: var(--card); border:1px solid var(--border); border-radius:10px; padding:8px 12px; cursor:pointer; }
.thread-row.unread { border-color: var(--accent); background: var(--accent-soft); }
.thread-row-body { flex:1; min-width:0; }
.thread-row-name { font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px; }
.thread-row-preview { font-size:12px; color: var(--ink-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:400px; }
.thread-row-time { font-size:10.5px; color: var(--ink-soft); flex-shrink:0; }
.thread-dot { width:7px; height:7px; border-radius:50%; background: var(--danger); display:inline-block; }

.teacher-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(230px,1fr)); gap:12px; align-items:stretch; }
.teacher-card { position:relative; text-align:left; background: var(--card); border:1px solid var(--border); border-radius:14px; padding:14px; display:flex; flex-direction:column; height:100%; }
.teacher-card-body { cursor:pointer; display:flex; flex-direction:column; flex:1; }
.teacher-card-actions { position:absolute; top:10px; right:10px; display:flex; gap:4px; z-index:2; }
.teacher-card-actions .btn-icon { width:24px; height:24px; }
.teacher-card:hover { border-color: var(--accent); }
.teacher-card-name { font-weight:700; font-size:14.5px; margin-bottom:2px; min-height:19px; }
.teacher-card-bio { font-size:12px; color: var(--ink-soft); margin: 6px 0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:33px; }
.teacher-card-stats { display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:8px; font-size:12px; color: var(--ink-soft); }
.teacher-card-stats span { display:flex; align-items:center; gap:5px; }

.avatar-img { border-radius:50%; object-fit:cover; }
.avatar-fallback { border-radius:50%; background: var(--accent-soft); color: var(--accent); display:flex; align-items:center; justify-content:center; font-weight:700; }

.admin-schedule-table { display:flex; flex-direction:column; gap:2px; }
.admin-schedule-row { display:grid; grid-template-columns: 1.3fr 1.3fr 0.8fr 1fr 0.8fr; gap:8px; padding:8px 10px; font-size:12.5px; background: var(--card); border-radius:8px; align-items:center; }
.admin-schedule-row.roster-row { grid-template-columns: 1.2fr 1.1fr 0.7fr 1.3fr 0.9fr 0.6fr 0.6fr; }
.compact-package-select { max-width: 130px; font-size: 11.5px; }
.admin-schedule-row.head { background:transparent; font-size:11px; text-transform:uppercase; color: var(--ink-soft); font-weight:600; letter-spacing:.03em; }

.teacher-layout { display:grid; grid-template-columns: 240px 1fr; gap: 16px; align-items:start; }
.col-students { background: var(--card); border:1px solid var(--border); border-radius:14px; padding:14px; }
.col-main { min-width:0; }
.col-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.student-list { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.student-item { position:relative; display:flex; align-items:center; gap:4px; text-align:left; background: var(--paper); border:1px solid transparent; border-radius:10px; padding:4px 4px 4px 10px; transition: transform .12s ease; }
.student-item:hover { transform: translateY(-1px); }
.student-item.active { border-color: var(--accent); background: var(--accent-soft); }
.student-item-clickable { flex: 1; min-width: 0; cursor: pointer; padding: 4px 0; }
.student-delete-btn { width:24px; height:24px; flex-shrink:0; opacity:.7; }
.student-delete-btn:hover { opacity:1; }
.student-item-top { display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:13.5px; }
.student-item-meta { display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap; }

@media (max-width: 900px) {
  .teacher-layout { grid-template-columns: 1fr; }
}

/* ---- v3 additions: stats, sales, availability, attachments, lesson notes ---- */

.school-stats { display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.school-stat { background: var(--card); border:1px solid var(--border); border-top:4px solid var(--accent); border-radius:14px; padding:12px 18px; min-width:150px; }
.school-stat-value { font-family: var(--font-display); font-size:24px; font-weight:700; color: var(--accent); }
.school-stat-label { font-size:11.5px; color: var(--ink-soft); margin-top:2px; }

.sales-stats { display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.finance-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:8px; }
.payout-rates-block { margin-top:12px; padding-top:10px; border-top: 1px dashed var(--border); }
.payout-rates-table { display:flex; flex-direction:column; gap:5px; }
.payout-rate-row { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12.5px; background: var(--paper); padding:5px 9px; border-radius:8px; }
.finance-cell { background: var(--paper); border-radius:10px; padding:10px 12px; }
.finance-value { font-family: var(--font-display); font-weight:700; font-size:16px; margin-top:2px; }
.finance-profit { background: var(--accent-soft); }
.finance-profit .finance-value { color: var(--accent); }
.finance-margin { background: var(--gold-soft); }
.finance-margin .finance-value { color: var(--gold); }
.products-dropdown-toggle { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; width:100%; text-align:left; padding:4px 0; }
.products-dropdown-list { margin-top:8px; }
.add-product-row { display:flex; align-items:center; gap:6px; justify-content:center; cursor:pointer; color: var(--accent); font-weight:600; border:1.5px dashed var(--border); background:transparent; }
.add-product-row:hover { border-color: var(--accent); }
.sales-stat { background: var(--paper); border-radius:12px; padding:10px 16px; min-width:130px; }
.sales-stat-label { font-size:11px; color: var(--ink-soft); text-transform:uppercase; letter-spacing:.03em; }
.sales-stat-value { font-family: var(--font-display); font-size:20px; font-weight:700; margin-top:2px; }
.sales-chart { display:flex; align-items:flex-end; gap:6px; height:110px; padding:8px 4px; margin-bottom:14px; border-bottom:1px solid var(--border); }
.sales-bar-col { display:flex; flex-direction:column; align-items:center; justify-content:flex-end; flex:1; height:100%; }
.sales-bar { width:100%; max-width:22px; background: var(--accent); border-radius:4px 4px 0 0; }
.sales-bar-label { font-size:9.5px; color: var(--ink-soft); margin-top:4px; }
.sales-log { display:flex; flex-direction:column; gap:4px; margin-top:10px; }
.sales-log-row { display:flex; align-items:center; gap:10px; font-size:12.5px; background: var(--paper); padding:6px 10px; border-radius:8px; }
.sales-log-row span:first-child { flex:1; }

.availability-toggle.is-open { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.availability-toggle.is-closed { background: var(--danger-soft); color: var(--danger); border-color: var(--danger); }

.teacher-profile-header { margin-bottom: 14px; }
.teacher-mini-card { display:flex; gap:10px; align-items:flex-start; background: var(--paper); border-radius:12px; padding:10px; margin-top:6px; }

.attachment-chip { display:inline-flex; align-items:center; gap:6px; margin-top:6px; }
.attachment-thumb { max-width:160px; max-height:120px; border-radius:8px; object-fit:cover; display:block; }
.attachment-file { display:inline-flex; align-items:center; gap:5px; font-size:12px; background: var(--paper); padding:4px 9px; border-radius:8px; color: var(--accent); text-decoration:none; }
.material-link { font-size:11.5px; color: var(--accent); margin-left:4px; }

.lesson-notes { margin-top:8px; padding-top:8px; border-top: 1px dashed var(--border); }
.lesson-notes-body { margin-top:8px; }

/* ---- v4 additions: chat, banner, checkpoints, package, lesson plan, payment, shop ---- */

.chat-row { display:flex; align-items:flex-end; gap:8px; margin-bottom:4px; width:100%; }
.chat-row.mine { justify-content:flex-end; }
.chat-row.theirs { justify-content:flex-start; }
.chat-bubble-wrap { display:flex; flex-direction:column; max-width:75%; }
.chat-row.mine .chat-bubble-wrap { align-items:flex-end; }
.chat-row.theirs .chat-bubble-wrap { align-items:flex-start; }
.chat-reactions { display:flex; gap:3px; margin-top:2px; }
.chat-reactions-summary { font-size:12px; margin-top:2px; }
.reaction-btn { font-size:15px; background: var(--card); border:1px solid var(--border); border-radius:999px; padding:2px 7px; cursor:pointer; }
.reaction-btn.active { background: var(--accent-soft); border-color: var(--accent); }

.student-banner { display:flex; align-items:center; gap:10px; border-radius:12px; padding:10px 14px; margin-bottom:12px; }
.student-banner-emoji { font-size:26px; }
.student-banner-stickers { display:flex; gap:6px; flex-wrap:wrap; }
.student-sticker { font-size:18px; }
.color-swatch { width:26px; height:26px; border-radius:8px; border:2px solid var(--border); cursor:pointer; }
.color-picker-native { width:26px; height:26px; padding:0; border:2px solid var(--border); border-radius:8px; cursor:pointer; background:none; }
.color-swatch.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.sticker-choice { font-size:16px; background: var(--card); border:1px solid var(--border); border-radius:8px; padding:3px 6px; cursor:pointer; }
.sticker-choice.active { background: var(--accent-soft); border-color: var(--accent); }

.checkpoint-list { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.checkpoint-item { background: var(--paper); border-radius:10px; padding:8px 10px; }
.checkpoint-score { font-weight:700; color: var(--accent); }

.package-tracker { }
.package-widget { display:inline-block; width:100%; }
.package-badge { display:inline-flex; align-items:center; gap:6px; background: var(--paper); border:1px solid var(--border); border-radius:999px; padding:4px 10px; font-size:12px; font-weight:600; cursor:pointer; max-width:100%; }
.package-badge:hover:not(:disabled) { border-color: var(--accent); }
.package-badge:disabled { cursor:default; opacity:.85; }
.package-badge-remaining { font-weight:700; color: var(--accent); }
.package-chevron { display:inline-block; transition: transform .15s ease; color: var(--ink-soft); }
.package-chevron.open { transform: rotate(90deg); }
.package-mini-progress { height:5px; margin-top:4px; margin-bottom:0; }
.package-expand-panel { margin-top:8px; background: var(--paper); border-radius:10px; padding:8px 10px; }
.package-quick-picks { display:flex; flex-wrap:wrap; gap:6px; }

.lesson-plan-timeline { display:flex; flex-direction:column; gap:10px; margin-top:8px; position:relative; padding-left:4px; }
.lesson-plan-row { display:flex; gap:10px; }
.lesson-plan-dot { width:10px; height:10px; border-radius:50%; background: var(--border); margin-top:6px; flex-shrink:0; }
.lesson-plan-row.done .lesson-plan-dot { background: var(--accent); }
.lesson-plan-row.upcoming .lesson-plan-dot { background: var(--gold); }
.lesson-plan-body { flex:1; background: var(--paper); border-radius:10px; padding:8px 10px; }

.meeting-link-row { margin-top:6px; }
.pay-slot-row { margin-top:6px; }
.goal-type-switch { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px; }
.exam-goal-box { background: var(--paper); border-radius:10px; padding:10px; margin-top:6px; }
.exam-subblock { margin-top:12px; padding-top:10px; border-top: 1px dashed var(--border); }
.progress-breakdown { margin-top:10px; display:flex; flex-direction:column; gap:5px; }
.mini-bar-row { display:flex; align-items:center; gap:8px; font-size:11.5px; }
.mini-bar-label { width:90px; flex-shrink:0; color: var(--ink-soft); }
.mini-bar-track { flex:1; height:6px; background: var(--border); border-radius:999px; overflow:hidden; }
.mini-bar-fill { height:100%; background: var(--accent); border-radius:999px; }
.mini-bar-value { width:34px; text-align:right; color: var(--ink-soft); }
.locked-link { font-style: italic; }
.pill-clickable { border:none; cursor:pointer; font-family: var(--font-ui); }

.month-switch { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }

.donut-row { display:flex; gap:20px; align-items:center; flex-wrap:wrap; margin-bottom:16px; }
.donut-chart { width:150px; height:150px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.donut-hole { width:100px; height:100px; border-radius:50%; background: var(--card); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.donut-hole-value { font-family: var(--font-display); font-weight:700; font-size:14px; }
.donut-hole-label { font-size:10px; color: var(--ink-soft); }
.donut-legend { display:flex; flex-direction:column; gap:6px; flex:1; min-width:200px; }
.donut-legend-row { display:flex; align-items:center; gap:8px; font-size:12.5px; }
.donut-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.donut-legend-name { flex:1; }
.donut-legend-value { font-weight:600; white-space:nowrap; }
`;