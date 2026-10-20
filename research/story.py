import math
inflation=1.02**(1/12)-1
cash=10000; pension=0; loan1=loan2=pay1=pay2=0; rent_received=0; costs=0; mincash=10000
monthly=0.03/12
annuity=lambda loan,n:loan*monthly/(1-(1+monthly)**(-n))
for month in range(1,481):
 f=1.02**(month/12)
 cash*=1+inflation
 if month==61:
  price=100000*f;cash-=.30*price;loan1=.8*price;pay1=annuity(loan1,300)
 if month==301:
  price=140000*f;cash-=.30*price;loan2=.8*price;pay2=annuity(loan2,240)
 income=1600*f
 living=600*f
 rent=600*f if month<=60 else 0
 owner=(100 if month>60 else 0)*f+(140 if month>300 else 0)*f
 rental_net=400*f if month>300 else 0
 pension_add=125 if month>60 else 0
 p1=min(loan1*(1+monthly),pay1) if loan1 else 0
 p2=min(loan2*(1+monthly),pay2) if loan2 else 0
 loan1=max(0,loan1*(1+monthly)-p1);loan2=max(0,loan2*(1+monthly)-p2)
 cash+=income+ rental_net-living-rent-owner-p1-p2-pension_add
 pension=pension*(1.025**(1/12))+pension_add
 rent_received+=rental_net/f;costs+=owner/f
 mincash=min(mincash,cash/f)
 if month in (60,61,300,301,360,480):print(month, 'cash real',round(cash/f),'loan real',round((loan1+loan2)/f), 'pension real',round(pension/f),'monthly spare real',round((income+rental_net-living-rent-owner-p1-p2-pension_add)/f))
f=1.02**40
r=1.03**(1/12)-1
emily=400*((1+r)**480-1)/r
print('Emily',emily,'3% monthly',emily*.03/12,'Carlos cash',cash/f,'pension',pension/f,'debt',loan2/f,'total',308000+(cash+pension-loan2)/f,'minimum cash',mincash,'rental net sum',rent_received,'owner costs',costs)
